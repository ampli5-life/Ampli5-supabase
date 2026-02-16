import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { api, createSubscription, getToken } from "@/lib/api";

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  instructor?: string;
  duration?: number;
  is_paid?: boolean;
}

const plans = [
  {
    id: "silver",
    name: "Silver",
    price: "$10",
    period: "/month",
    description: "Full access to premium videos.",
    features: ["Full paid video library", "New classes weekly", "All difficulty levels", "Cancel anytime"],
    cta: "Subscribe",
    popular: false,
  },
  {
    id: "gold",
    name: "Gold",
    price: "$75",
    period: "/year",
    description: "Best value. All content, billed annually.",
    features: ["Everything in Silver", "Billed yearly", "All future content", "Best value"],
    cta: "Subscribe",
    popular: true,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
};

const Pricing = () => {
  const navigate = useNavigate();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paidVideos, setPaidVideos] = useState<Video[]>([]);

  useEffect(() => {
    api.get<Video[]>("/videos").then((data) => {
      setPaidVideos(Array.isArray(data) ? data.filter((v) => v.is_paid).slice(0, 6) : []);
    }).catch(() => []);
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId !== "silver" && planId !== "gold") return;

    if (!getToken()) {
      navigate(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setError(null);
    setLoadingPlanId(planId);
    try {
      const { approvalUrl } = await createSubscription(planId);
      if (approvalUrl) {
        window.location.href = approvalUrl;
        return;
      }
      setError("Unable to start subscription. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Subscription failed. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
  <>
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container text-center">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Simple, Honest Pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">Choose the plan that fits your journey. All plans include full access to our paid video library.</p>
      </div>
    </section>

    <section className="py-20">
      <div className="container">
        <p className="mb-6 text-center text-sm text-muted-foreground">No contracts. Cancel anytime. No hidden fees.</p>
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className={`relative flex h-full flex-col border-2 ${plan.popular ? "border-primary shadow-lg" : "border-transparent shadow-sm"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Best value
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="font-serif text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground"> {plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlanId !== null}
                  >
                    {loadingPlanId === plan.id ? "Redirecting..." : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Member exclusives teaser */}
        <div className="mt-16">
          <h2 className="mb-8 text-center font-serif text-3xl font-bold">Member Exclusives</h2>
          <p className="mx-auto mb-8 max-w-xl text-center text-muted-foreground">All plans include full access to our paid library, including these popular classes.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paidVideos.map((video, i) => (
              <motion.div key={video.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="overflow-hidden border-0 shadow-sm">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.thumbnailUrl || video.thumbnail_url || ""} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                      <Lock className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">Members only</Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{video.instructor} · {video.duration != null ? `${Math.floor(video.duration / 60)} min` : "—"}</p>
                    <h3 className="mt-1 font-serif font-semibold leading-snug">{video.title}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {paidVideos.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Subscribe to access premium classes.</p>
          )}
        </div>
      </div>
    </section>
  </>
  );
};

export default Pricing;
