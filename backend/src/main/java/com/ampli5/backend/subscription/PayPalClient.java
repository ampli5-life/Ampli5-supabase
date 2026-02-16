package com.ampli5.backend.subscription;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PayPalClient {

    private static final String SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
    private static final String LIVE_BASE = "https://api-m.paypal.com";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String clientId;
    private final String clientSecret;
    private final boolean sandbox;
    private final String returnUrl;
    private final String cancelUrl;

    private String cachedAccessToken;
    private long tokenExpiryMs;

    public PayPalClient(
            @Qualifier("paypalRestTemplate") RestTemplate paypalRestTemplate,
            ObjectMapper objectMapper,
            @Value("${paypal.client-id}") String clientId,
            @Value("${paypal.client-secret}") String clientSecret,
            @Value("${paypal.mode:sandbox}") String mode,
            @Value("${paypal.return-url:http://localhost:5173/subscription-success}") String returnUrl,
            @Value("${paypal.cancel-url:http://localhost:5173/}") String cancelUrl) {
        this.restTemplate = paypalRestTemplate;
        this.objectMapper = objectMapper;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.sandbox = mode == null || "sandbox".equalsIgnoreCase(mode);
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
    }

    private String getBaseUrl() {
        return sandbox ? SANDBOX_BASE : LIVE_BASE;
    }

    private String getAccessToken() {
        if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpiryMs) {
            return cachedAccessToken;
        }
        String auth = clientId + ":" + clientSecret;
        String encoded = Base64.getEncoder().encodeToString(auth.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>("grant_type=client_credentials", headers);
        ResponseEntity<String> resp = restTemplate.exchange(
                getBaseUrl() + "/v1/oauth2/token",
                HttpMethod.POST,
                entity,
                String.class);

        try {
            JsonNode json = objectMapper.readTree(resp.getBody());
            cachedAccessToken = json.get("access_token").asText();
            int expiresIn = json.has("expires_in") ? json.get("expires_in").asInt() : 3600;
            tokenExpiryMs = System.currentTimeMillis() + (expiresIn - 60) * 1000L;
            return cachedAccessToken;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get PayPal access token", e);
        }
    }

    public CreateSubscriptionResult createSubscription(String planId, String customId) {
        if (clientId == null || clientId.isBlank() || "your_paypal_sandbox_client_id".equals(clientId)) {
            throw new IllegalStateException("PayPal is not configured. Set paypal.client-id and paypal.client-secret.");
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("plan_id", planId);
        if (customId != null && !customId.isBlank()) {
            body.put("custom_id", customId);
        }
        ObjectNode appContext = objectMapper.createObjectNode();
        appContext.put("return_url", returnUrl);
        appContext.put("cancel_url", cancelUrl);
        body.set("application_context", appContext);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Prefer", "return=representation");

        HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
        ResponseEntity<String> resp = restTemplate.exchange(
                getBaseUrl() + "/v1/billing/subscriptions",
                HttpMethod.POST,
                entity,
                String.class);

        if (resp.getStatusCode().value() != 201) {
            throw new RuntimeException("PayPal create subscription failed: " + resp.getBody());
        }

        try {
            JsonNode json = objectMapper.readTree(resp.getBody());
            String subscriptionId = json.has("id") ? json.get("id").asText() : null;
            String status = json.has("status") ? json.get("status").asText() : null;
            String approvalUrl = null;
            if (json.has("links")) {
                for (JsonNode link : json.get("links")) {
                    if ("approve".equals(link.has("rel") ? link.get("rel").asText() : null)) {
                        approvalUrl = link.get("href").asText();
                        break;
                    }
                }
            }
            return new CreateSubscriptionResult(subscriptionId, status, approvalUrl);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse PayPal subscription response", e);
        }
    }

    public SubscriptionDetails getSubscriptionDetails(String subscriptionId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<String> resp = restTemplate.exchange(
                getBaseUrl() + "/v1/billing/subscriptions/" + subscriptionId,
                HttpMethod.GET,
                entity,
                String.class);

        if (resp.getStatusCode().value() != 200) {
            throw new RuntimeException("PayPal get subscription failed: " + resp.getBody());
        }

        try {
            JsonNode json = objectMapper.readTree(resp.getBody());
            String status = json.has("status") ? json.get("status").asText() : null;
            String planId = json.has("plan_id") ? json.get("plan_id").asText() : null;
            String startTime = json.has("start_time") ? json.get("start_time").asText() : null;
            return new SubscriptionDetails(subscriptionId, status, planId, startTime);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse PayPal subscription details", e);
        }
    }

    public record CreateSubscriptionResult(String subscriptionId, String status, String approvalUrl) {}
    public record SubscriptionDetails(String subscriptionId, String status, String planId, String startTime) {}
}
