import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createSubscription, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionPlanModalProps {
  onClose: () => void;
}

const PLANS = [
  { id: "free", name: "Free", price: null, billing: null, description: "Access to free content only." },
  { id: "silver", name: "Silver", price: "$10", billing: "per month", description: "Full access to premium videos." },
  { id: "gold", name: "Gold", price: "$75", billing: "yearly", description: "Best value. All content, billed annually." },
];

export function SubscriptionPlanModal({ onClose }: SubscriptionPlanModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") return;
    if (planId !== "silver" && planId !== "gold") return;
    if (!getToken()) {
      setError("Please log in to subscribe.");
      return;
    }
    setError(null);
    setLoading(planId);
    try {
      const { approvalUrl } = await createSubscription(planId);
      if (approvalUrl) {
        window.location.href = approvalUrl;
        return;
      }
      setError("Unable to start subscription. Please try again.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Subscription failed. Please try again.";
      setError(message);
      if (message === "Session expired. Please log in again.") onClose();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-modal="true"
      aria-label="Choose a subscription plan"
    >
      <div
        className="relative bg-background rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold">Choose a Plan</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardContent className="p-5 flex flex-col gap-4 flex-1">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  {plan.price ? (
                    <>
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.billing}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex-1">{plan.description}</p>
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.id !== "free" && loading !== null}
                  variant={plan.id === "free" ? "secondary" : "default"}
                  className="w-full"
                >
                  {plan.id === "free"
                    ? "Current Plan"
                    : loading === plan.id
                      ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirecting...</>
                      : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
