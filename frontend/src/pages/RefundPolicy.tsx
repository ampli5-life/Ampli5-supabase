import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => (
  <div className="py-12">
    <div className="container max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Home</Link>
      </Button>
      <h1 className="font-serif text-3xl font-bold">Refund Policy</h1>
      <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed">
        <p>Last updated: January 1, 2026</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">Monthly & Annual Plans</h2>
        <p>You may cancel your subscription at any time. You will retain access until the end of your current billing period. We do not offer partial refunds for unused time within a billing cycle.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">Lifetime Plans</h2>
        <p>Lifetime plan purchases are eligible for a full refund within 14 days of purchase if you have not accessed more than 5 paid videos. After this period, lifetime purchases are non-refundable.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">How to Request a Refund</h2>
        <p>To request a refund, please email hello@ampli5.life with your account email and reason for the request. Refunds are processed within 5–10 business days.</p>
      </div>
    </div>
  </div>
);

export default RefundPolicy;
