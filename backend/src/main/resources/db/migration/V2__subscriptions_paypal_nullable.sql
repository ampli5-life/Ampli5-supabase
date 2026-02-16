-- Make paypal_subscription_id nullable for Stripe-only subscriptions
ALTER TABLE subscriptions ALTER COLUMN paypal_subscription_id DROP NOT NULL;
