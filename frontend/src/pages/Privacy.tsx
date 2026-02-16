import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => (
  <div className="py-12">
    <div className="container max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Home</Link>
      </Button>
      <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed">
        <p>Last updated: January 1, 2026</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect information you provide when creating an account, including your name, email address, and payment information processed through Stripe.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
        <p>Your information is used to provide and improve our services, process payments, send important notifications, and personalize your experience.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">3. Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal information. Payment data is processed securely through Stripe and never stored on our servers.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">4. Cookies</h2>
        <p>We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>
        <h2 className="font-serif text-xl font-semibold text-foreground">5. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at hello@ampli5.life.</p>
      </div>
    </div>
  </div>
);

export default Privacy;
