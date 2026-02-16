package com.ampli5.backend.subscription;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/api")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/subscriptions/create")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        String planId = body != null ? body.get("planId") : null;
        if (planId == null || planId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "planId is required"));
        }
        UUID userId = UUID.fromString(principal.getName());
        try {
            SubscriptionService.CreateSubscriptionResponse resp = subscriptionService.createSubscription(userId, planId);
            return ResponseEntity.ok(Map.of(
                    "subscriptionId", resp.subscriptionId(),
                    "approvalUrl", resp.approvalUrl()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/subscriptions/confirm-session")
    public ResponseEntity<?> confirmBySession(@RequestBody Map<String, String> body) {
        String sessionId = body != null ? body.get("sessionId") : null;
        if (sessionId == null || sessionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "sessionId is required"));
        }
        try {
            SubscriptionService.ConfirmSubscriptionResponse resp = subscriptionService.confirmSubscriptionBySession(sessionId);
            return ResponseEntity.ok(Map.of(
                    "success", resp.success(),
                    "plan", resp.planId() != null ? resp.planId() : "",
                    "startDate", resp.startDate() != null ? resp.startDate().toString() : "",
                    "endDate", resp.endDate() != null ? resp.endDate().toString() : ""));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/subscriptions/confirm")
    public ResponseEntity<?> confirm(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        String sessionId = body != null ? body.get("sessionId") : null;
        String subscriptionId = body != null ? body.get("subscriptionId") : null;
        String id = (sessionId != null && !sessionId.isBlank()) ? sessionId : subscriptionId;
        if (id == null || id.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "sessionId is required"));
        }
        UUID userId = UUID.fromString(principal.getName());
        try {
            SubscriptionService.ConfirmSubscriptionResponse resp = subscriptionService.confirmSubscription(userId, id);
            return ResponseEntity.ok(Map.of(
                    "success", resp.success(),
                    "plan", resp.planId() != null ? resp.planId() : "",
                    "startDate", resp.startDate() != null ? resp.startDate().toString() : "",
                    "endDate", resp.endDate() != null ? resp.endDate().toString() : ""));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/subscriptions/status")
    public ResponseEntity<?> status(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        UUID userId = UUID.fromString(principal.getName());
        SubscriptionService.SubscriptionStatusResponse resp = subscriptionService.getStatus(userId);
        return ResponseEntity.ok(Map.of(
                "isSubscribed", resp.isSubscribed(),
                "plan", resp.plan() != null ? resp.plan() : "",
                "planDisplayName", resp.planDisplayName() != null ? resp.planDisplayName() : "",
                "startDate", resp.startDate() != null ? resp.startDate().toString() : "",
                "endDate", resp.endDate() != null ? resp.endDate().toString() : ""));
    }

    @PostMapping(value = "/stripe/webhook", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> stripeWebhook(@RequestBody byte[] payload, @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        try {
            subscriptionService.handleStripeWebhook(payload, signature != null ? signature : "");
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

}
