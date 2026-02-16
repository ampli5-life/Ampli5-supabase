package com.ampli5.backend.subscription;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByUserIdAndStatus(UUID userId, String status);

    Optional<Subscription> findByPaypalSubscriptionId(String paypalSubscriptionId);

    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}
