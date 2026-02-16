package com.ampli5.backend.subscription;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeSubscriptionService {

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.price.silver:}")
    private String silverPriceId;

    @Value("${stripe.price.gold:}")
    private String goldPriceId;

    @Value("${stripe.success-url:http://localhost:5173/subscription-success}")
    private String successUrl;

    @Value("${stripe.cancel-url:http://localhost:5173/}")
    private String cancelUrl;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
        }
    }

    public boolean isConfigured() {
        return secretKey != null && !secretKey.isBlank()
                && silverPriceId != null && !silverPriceId.isBlank()
                && goldPriceId != null && !goldPriceId.isBlank();
    }

    private String resolvePriceId(String planId) {
        if (planId == null) return null;
        if ("silver".equalsIgnoreCase(planId)) return silverPriceId;
        if ("gold".equalsIgnoreCase(planId)) return goldPriceId;
        return planId;
    }

    public record CheckoutSessionResult(String sessionId, String url) {}

    public CheckoutSessionResult createCheckoutSession(UUID userId, String planId) {
        if (!isConfigured()) {
            throw new IllegalStateException(
                "Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_SILVER, and STRIPE_PRICE_GOLD.");
        }
        String priceId = resolvePriceId(planId);
        if (priceId == null || priceId.isBlank()) {
            throw new IllegalArgumentException("Invalid plan: " + planId + ". Use silver or gold.");
        }

        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setPrice(priceId)
                .setQuantity(1L)
                .build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(successUrl + (successUrl.contains("?") ? "&" : "?") + "session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(userId.toString())
                .addLineItem(lineItem)
                .build();

        try {
            Session session = Session.create(params);
            return new CheckoutSessionResult(session.getId(), session.getUrl());
        } catch (Exception e) {
            throw new RuntimeException("Stripe Checkout Session creation failed: " + e.getMessage(), e);
        }
    }

    public record SubscriptionDetails(String stripeSubscriptionId, String planId,
                                      OffsetDateTime startDate, OffsetDateTime endDate) {}

    public SubscriptionDetails retrieveSubscriptionFromSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
        try {
            Session session = Session.retrieve(sessionId);
            String subId = session.getSubscription();
            if (subId == null || subId.isBlank()) {
                throw new IllegalStateException("Checkout session has no subscription");
            }
            Subscription subscription = Subscription.retrieve(subId);
            String priceId = null;
            if (subscription.getItems() != null && !subscription.getItems().getData().isEmpty()) {
                try {
                    Object price = subscription.getItems().getData().get(0).getPrice();
                    if (price instanceof com.stripe.model.Price) {
                        priceId = ((com.stripe.model.Price) price).getId();
                    } else if (price != null) {
                        priceId = price.toString();
                    }
                } catch (Exception ignored) {}
            }
            String planId = "silver";
            if (priceId != null && priceId.equals(goldPriceId)) {
                planId = "gold";
            } else if (priceId != null && priceId.equals(silverPriceId)) {
                planId = "silver";
            }

            Long start = subscription.getCurrentPeriodStart();
            Long end = subscription.getCurrentPeriodEnd();
            OffsetDateTime startDate = start != null
                    ? OffsetDateTime.ofInstant(Instant.ofEpochSecond(start), ZoneOffset.UTC)
                    : OffsetDateTime.now(ZoneOffset.UTC);
            OffsetDateTime endDate = end != null
                    ? OffsetDateTime.ofInstant(Instant.ofEpochSecond(end), ZoneOffset.UTC)
                    : startDate.plusMonths(1);

            return new SubscriptionDetails(subId, planId, startDate, endDate);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve Stripe session/subscription: " + e.getMessage(), e);
        }
    }

    public void handleWebhook(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return;
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new IllegalArgumentException("Invalid Stripe webhook signature", e);
        }

        EventDataObjectDeserializer data = event.getDataObjectDeserializer();
        if (data.getObject().isEmpty()) {
            return;
        }
        StripeObject stripeObject = data.getObject().get();

        switch (event.getType()) {
            case "customer.subscription.updated" -> {
                if (stripeObject instanceof Subscription sub) {
                    subscriptionRepository.findByStripeSubscriptionId(sub.getId()).ifPresent(s -> {
                        if ("active".equals(sub.getStatus())) {
                            Long start = sub.getCurrentPeriodStart();
                            Long end = sub.getCurrentPeriodEnd();
                            if (start != null) {
                                s.setStartDate(OffsetDateTime.ofInstant(Instant.ofEpochSecond(start), ZoneOffset.UTC));
                            }
                            if (end != null) {
                                s.setEndDate(OffsetDateTime.ofInstant(Instant.ofEpochSecond(end), ZoneOffset.UTC));
                            }
                            s.setStatus("ACTIVE");
                        } else if ("canceled".equals(sub.getStatus()) || "unpaid".equals(sub.getStatus())) {
                            s.setStatus("CANCELLED");
                        }
                        subscriptionRepository.save(s);
                    });
                }
            }
            case "customer.subscription.deleted" -> {
                if (stripeObject instanceof Subscription sub) {
                    subscriptionRepository.findByStripeSubscriptionId(sub.getId()).ifPresent(s -> {
                        s.setStatus("CANCELLED");
                        subscriptionRepository.save(s);
                    });
                }
            }
            default -> {}
        }
    }

    private final SubscriptionRepository subscriptionRepository;

    public StripeSubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }
}
