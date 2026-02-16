import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => (
  <div className="py-12">
    <div className="container max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Home</Link>
      </Button>
      <h1 className="font-serif text-3xl font-bold">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed">
        <p>Last updated: January 1, 2026</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing and using Ampli5.Life, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">2. Services</h2>
        <p>Ampli5.Life provides online yoga classes and wellness content through free and paid membership plans. Access to paid content requires an active subscription.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">3. Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an account.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">4. Subscriptions & Payments</h2>
        <p>Paid memberships are billed according to the plan selected. Monthly and annual plans auto-renew unless cancelled. Lifetime plans are one-time purchases.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">5. Content Usage</h2>
        <p>All video content, written materials, and graphics are the intellectual property of Ampli5.Life. You may not distribute, reproduce, or share paid content.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
        <p>Ampli5.Life is not liable for injuries or health issues resulting from following our yoga classes. Always consult a physician before starting any exercise program.</p>
      </div>
    </div>
  </div>
);

export default Terms;
