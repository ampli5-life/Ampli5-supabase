package com.ampli5.backend.subscription;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    private static final String ACTIVE = "ACTIVE";

    private final SubscriptionRepository subscriptionRepository;
    private final StripeSubscriptionService stripeSubscriptionService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            StripeSubscriptionService stripeSubscriptionService) {
        this.subscriptionRepository = subscriptionRepository;
        this.stripeSubscriptionService = stripeSubscriptionService;
    }

    public CreateSubscriptionResponse createSubscription(UUID userId, String planId) {
        if (!stripeSubscriptionService.isConfigured()) {
            throw new IllegalStateException(
                "Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_SILVER, and STRIPE_PRICE_GOLD in .env.");
        }
        StripeSubscriptionService.CheckoutSessionResult result = stripeSubscriptionService.createCheckoutSession(userId, planId);
        return new CreateSubscriptionResponse(result.sessionId(), result.url());
    }

    @Transactional
    public ConfirmSubscriptionResponse confirmSubscription(UUID userId, String subscriptionIdOrSessionId) {
        if (subscriptionIdOrSessionId == null || subscriptionIdOrSessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
        if (!subscriptionIdOrSessionId.startsWith("cs_")) {
            throw new IllegalArgumentException(
                "Invalid session ID. After checkout, use the session_id from the success URL (starts with cs_).");
        }
        return confirmStripeSubscription(userId, subscriptionIdOrSessionId);
    }

    @Transactional
    public ConfirmSubscriptionResponse confirmStripeSubscription(UUID userId, String sessionId) {
        StripeSubscriptionService.SubscriptionDetails details = stripeSubscriptionService.retrieveSubscriptionFromSession(sessionId);
        Optional<Subscription> existing = subscriptionRepository.findByStripeSubscriptionId(details.stripeSubscriptionId());
        if (existing.isPresent()) {
            Subscription sub = existing.get();
            if (!sub.getUserId().equals(userId)) {
                throw new IllegalArgumentException("Subscription belongs to another user");
            }
            sub.setStatus(ACTIVE);
            sub.setStartDate(details.startDate());
            sub.setEndDate(details.endDate());
            subscriptionRepository.save(sub);
            return new ConfirmSubscriptionResponse(true, sub.getPlanId(), sub.getStartDate(), sub.getEndDate());
        }
        Subscription sub = new Subscription();
        sub.setUserId(userId);
        sub.setStripeSubscriptionId(details.stripeSubscriptionId());
        sub.setPlanId(details.planId());
        sub.setStatus(ACTIVE);
        sub.setStartDate(details.startDate());
        sub.setEndDate(details.endDate());
        subscriptionRepository.save(sub);
        return new ConfirmSubscriptionResponse(true, sub.getPlanId(), sub.getStartDate(), sub.getEndDate());
    }

    private String planDisplayName(String planId) {
        if (planId == null) return "";
        if ("gold".equalsIgnoreCase(planId)) return "Gold";
        if ("silver".equalsIgnoreCase(planId)) return "Silver";
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

    public void handleStripeWebhook(byte[] payload, String signature) {
        stripeSubscriptionService.handleWebhook(new String(payload, StandardCharsets.UTF_8), signature);
    }

    public record CreateSubscriptionResponse(String subscriptionId, String approvalUrl) {}
    public record ConfirmSubscriptionResponse(boolean success, String planId, OffsetDateTime startDate, OffsetDateTime endDate) {}
    public record SubscriptionStatusResponse(boolean isSubscribed, String plan, OffsetDateTime startDate, OffsetDateTime endDate, String planDisplayName) {}
}
