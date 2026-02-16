package com.ampli5.backend.subscription;

import com.ampli5.backend.auth.UserRepository;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    private static final String ACTIVE = "ACTIVE";
    private static final String APPROVAL_PENDING = "APPROVAL_PENDING";

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PayPalClient payPalClient;
    private final String silverPlanId;
    private final String goldPlanId;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository,
            PayPalClient payPalClient,
            @Value("${paypal.plan.silver:}") String silverPlanId,
            @Value("${paypal.plan.gold:}") String goldPlanId) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.payPalClient = payPalClient;
        this.silverPlanId = silverPlanId;
        this.goldPlanId = goldPlanId;
    }

    private String resolvePlanId(String planId) {
        if ("silver".equalsIgnoreCase(planId) && silverPlanId != null && !silverPlanId.isBlank()) {
            return silverPlanId;
        }
        if ("gold".equalsIgnoreCase(planId) && goldPlanId != null && !goldPlanId.isBlank()) {
            return goldPlanId;
        }
        return planId;
    }

    /** 1 month for Silver, 1 year for Gold (by plan ID). */
    private OffsetDateTime computeEndDate(OffsetDateTime start, String planId) {
        if (start == null) start = OffsetDateTime.now();
        if (goldPlanId != null && !goldPlanId.isBlank() && goldPlanId.equals(planId)) {
            return start.plus(1, ChronoUnit.YEARS);
        }
        return start.plus(1, ChronoUnit.MONTHS);
    }

    private void setStartAndEndDate(Subscription sub) {
        OffsetDateTime start = sub.getStartDate() != null ? sub.getStartDate() : OffsetDateTime.now();
        sub.setStartDate(start);
        sub.setEndDate(computeEndDate(start, sub.getPlanId()));
    }

    public CreateSubscriptionResponse createSubscription(UUID userId, String planId) {
        String resolvedPlanId = resolvePlanId(planId);
        if (resolvedPlanId.isBlank()) {
            throw new IllegalArgumentException(
                "PayPal plan IDs not set. Add PAYPAL_PLAN_SILVER and PAYPAL_PLAN_GOLD to .env (copy Plan IDs from PayPal dashboard). "
                + "If running the backend locally, the process does not load .env automatically—export the variables or restart after loading .env.");
        }
        PayPalClient.CreateSubscriptionResult result = payPalClient.createSubscription(resolvedPlanId, userId.toString());
        return new CreateSubscriptionResponse(result.subscriptionId(), result.approvalUrl());
    }

    @Transactional
    public ConfirmSubscriptionResponse confirmSubscription(UUID userId, String subscriptionId) {
        PayPalClient.SubscriptionDetails details = payPalClient.getSubscriptionDetails(subscriptionId);
        if (!ACTIVE.equals(details.status()) && !APPROVAL_PENDING.equals(details.status())) {
            throw new IllegalStateException("Subscription is not active. Status: " + details.status());
        }
        Optional<Subscription> existing = subscriptionRepository.findByPaypalSubscriptionId(subscriptionId);
        if (existing.isPresent()) {
            Subscription sub = existing.get();
            if (!sub.getUserId().equals(userId)) {
                throw new IllegalArgumentException("Subscription belongs to another user");
            }
            sub.setStatus(ACTIVE);
            if (sub.getStartDate() == null && details.startTime() != null) {
                try {
                    sub.setStartDate(OffsetDateTime.parse(details.startTime(), DateTimeFormatter.ISO_DATE_TIME));
                } catch (Exception ignored) {}
            }
            setStartAndEndDate(sub);
            subscriptionRepository.save(sub);
            return new ConfirmSubscriptionResponse(true, sub.getPlanId(), sub.getStartDate(), sub.getEndDate());
        }
        Subscription sub = new Subscription();
        sub.setUserId(userId);
        sub.setPaypalSubscriptionId(subscriptionId);
        sub.setPlanId(details.planId() != null ? details.planId() : "unknown");
        sub.setStatus(ACTIVE);
        if (details.startTime() != null) {
            try {
                sub.setStartDate(OffsetDateTime.parse(details.startTime(), DateTimeFormatter.ISO_DATE_TIME));
            } catch (Exception ignored) {}
        }
        setStartAndEndDate(sub);
        subscriptionRepository.save(sub);
        return new ConfirmSubscriptionResponse(true, sub.getPlanId(), sub.getStartDate(), sub.getEndDate());
    }

    private String planDisplayName(String planId) {
        if (planId == null) return "";
        if (goldPlanId != null && goldPlanId.equals(planId)) return "Gold";
        if (silverPlanId != null && silverPlanId.equals(planId)) return "Silver";
        return planId;
    }

    public SubscriptionStatusResponse getStatus(UUID userId) {
        Optional<Subscription> sub = subscriptionRepository.findByUserIdAndStatus(userId, ACTIVE);
        if (sub.isEmpty()) {
            return new SubscriptionStatusResponse(false, null, null, null, "");
        }
        Subscription s = sub.get();
        OffsetDateTime now = OffsetDateTime.now();
        boolean valid = s.getEndDate() == null || s.getEndDate().isAfter(now);
        return new SubscriptionStatusResponse(valid, s.getPlanId(), s.getStartDate(), s.getEndDate(), planDisplayName(s.getPlanId()));
    }

    public void handleWebhook(Map<String, Object> payload) {
        String eventType = (String) payload.get("event_type");
        if (eventType == null) return;
        Object resource = payload.get("resource");
        if (!(resource instanceof Map)) return;
        @SuppressWarnings("unchecked")
        Map<String, Object> res = (Map<String, Object>) resource;
        String subscriptionId = (String) res.get("id");
        if (subscriptionId == null) return;

        switch (eventType) {
            case "BILLING.SUBSCRIPTION.ACTIVATED" -> activateSubscription(subscriptionId, res);
            case "BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED" -> cancelSubscription(subscriptionId);
            default -> {}
        }
    }

    private void activateSubscription(String subscriptionId, Map<String, Object> resource) {
        Optional<Subscription> opt = subscriptionRepository.findByPaypalSubscriptionId(subscriptionId);
        if (opt.isEmpty()) {
            String customId = (String) resource.get("custom_id");
            if (customId != null) {
                try {
                    UUID userId = UUID.fromString(customId);
                    if (userRepository.findById(userId).isPresent()) {
                        Subscription sub = new Subscription();
                        sub.setUserId(userId);
                        sub.setPaypalSubscriptionId(subscriptionId);
                        sub.setPlanId((String) resource.getOrDefault("plan_id", "unknown"));
                        sub.setStatus(ACTIVE);
                        String startTime = (String) resource.get("start_time");
                        if (startTime != null) {
                            try {
                                sub.setStartDate(OffsetDateTime.parse(startTime, DateTimeFormatter.ISO_DATE_TIME));
                            } catch (Exception ignored) {}
                        }
                        setStartAndEndDate(sub);
                        subscriptionRepository.save(sub);
                    }
                } catch (Exception ignored) {}
            }
        } else {
            Subscription sub = opt.get();
            sub.setStatus(ACTIVE);
            if (sub.getStartDate() == null) {
                String startTime = (String) resource.get("start_time");
                if (startTime != null) {
                    try {
                        sub.setStartDate(OffsetDateTime.parse(startTime, DateTimeFormatter.ISO_DATE_TIME));
                    } catch (Exception ignored) {}
                }
            }
            setStartAndEndDate(sub);
            subscriptionRepository.save(sub);
        }
    }

    private void cancelSubscription(String subscriptionId) {
        subscriptionRepository.findByPaypalSubscriptionId(subscriptionId).ifPresent(sub -> {
            sub.setStatus("CANCELLED");
            subscriptionRepository.save(sub);
        });
    }

    public record CreateSubscriptionResponse(String subscriptionId, String approvalUrl) {}
    public record ConfirmSubscriptionResponse(boolean success, String planId, OffsetDateTime startDate, OffsetDateTime endDate) {}
    public record SubscriptionStatusResponse(boolean isSubscribed, String plan, OffsetDateTime startDate, OffsetDateTime endDate, String planDisplayName) {}
}
