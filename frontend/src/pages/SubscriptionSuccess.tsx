import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { confirmSubscription, confirmSubscriptionBySession } from "@/lib/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const SubscriptionSuccess = () => {
  const { refreshSubscription } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(hash);
    const fromQuery = (name: string) => searchParams.get(name) || hashParams.get(name);
    const sessionId = fromQuery("session_id");
    const subscriptionId =
      sessionId || fromQuery("subscription_id") || fromQuery("token") || fromQuery("ba_token");
    if (!subscriptionId) {
      setStatus("error");
      setMessage(
        "Missing checkout session. Did you complete the checkout? Return to the app and try subscribing again."
      );
      return;
    }
    const confirmFn = subscriptionId.startsWith("cs_")
      ? confirmSubscriptionBySession(subscriptionId)
      : confirmSubscription(subscriptionId);
    confirmFn
      .then(() => {
        setStatus("success");
        refreshSubscription();
        window.history.replaceState({}, "", "/");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Failed to confirm subscription");
      });
  }, [refreshSubscription, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="bg-background rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Confirming your subscription...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Subscription confirmed!</h2>
            <p className="text-muted-foreground mt-2">Redirecting you back...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground mt-2">{message}</p>
            <a href="/" className="mt-4 inline-block text-primary hover:underline font-medium">
              Return to home
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
