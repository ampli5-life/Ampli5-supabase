package com.ampli5.backend.subscription;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        } catch (org.springframework.web.client.RestClientException e) {
            String raw = e.getMessage() != null ? e.getMessage() : "";
            String msg;
            if (raw.contains("RESOURCE_NOT_FOUND")) {
                msg = "PayPal plan not found. Your .env has plan IDs set; ensure the Subscription plans were created in the same PayPal app (and same Sandbox/Live) as your Client ID. In developer.paypal.com: use the same account for Apps & Credentials and for Products & Services → Subscription plans, then copy the Plan IDs again into .env and restart the backend.";
            } else if (raw.contains("401") || raw.contains("Unauthorized")) {
                msg = "PayPal 401 Unauthorized. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env: they must be the credentials for the same environment (Live or Sandbox) as PAYPAL_MODE. In developer.paypal.com, open the correct app, click Show next to Secret, copy the full Client ID and Secret with no extra spaces, update .env, and restart the backend.";
            } else {
                msg = "PayPal error: " + (raw.isEmpty() ? "Unknown" : raw);
            }
            return ResponseEntity.status(502).body(Map.of("message", msg));
        }
    }

    @PostMapping("/subscriptions/confirm")
    public ResponseEntity<?> confirm(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }
        String subscriptionId = body != null ? body.get("subscriptionId") : null;
        if (subscriptionId == null || subscriptionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "subscriptionId is required"));
        }
        UUID userId = UUID.fromString(principal.getName());
        try {
            SubscriptionService.ConfirmSubscriptionResponse resp = subscriptionService.confirmSubscription(userId, subscriptionId);
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

    @PostMapping("/paypal/webhook")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload) {
        try {
            subscriptionService.handleWebhook(payload);
        } catch (Exception e) {
            // Log but return 200 to avoid retries
        }
        return ResponseEntity.ok().build();
    }
}
