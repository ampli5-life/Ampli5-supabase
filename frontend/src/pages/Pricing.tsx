import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock, Play, Clock, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { api, createSubscription } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  youtube_url?: string;
  instructor?: string;
  duration?: number;
  is_paid?: boolean;
  category?: string;
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
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function getThumb(v: Video): string | null {
  const provided = v.thumbnailUrl || v.thumbnail_url;
  if (provided) return provided;
  const ytId = extractYouTubeId(v.youtube_url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paidVideos, setPaidVideos] = useState<Video[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Video[]>("/videos").then((data) => {
      setPaidVideos(Array.isArray(data) ? data.filter((v) => v.is_paid).slice(0, 6) : []);
    }).catch(() => []);
  }, []);

  const SUBSCRIBE_TIMEOUT_MS = 25000;

  const handleSubscribe = async (planId: string) => {
    if (planId !== "silver" && planId !== "gold") return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    setError(null);
    setLoadingPlanId(planId);
    try {
      const { approvalUrl } = await Promise.race([
        createSubscription(planId),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Checkout is taking too long. Please try again.")), SUBSCRIBE_TIMEOUT_MS)
        ),
      ]);
      if (approvalUrl) { window.location.href = approvalUrl; return; }
      setError("Unable to start subscription. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Subscription failed. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-card" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(221,83%,53%)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/3 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground dark:text-foreground mb-4"
          >
            Simple, Honest Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-primary-foreground/70 dark:text-foreground/60 text-lg max-w-xl mx-auto"
          >
            Choose the plan that fits your journey. All plans include full access to our premium video library.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="mb-8 text-center text-sm text-muted-foreground">No contracts. Cancel anytime. No hidden fees.</p>

          {error && (
            <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-3 text-sm text-destructive text-center max-w-xl mx-auto">
              {error}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            {plans.map((plan, i) => (
              <motion.div key={plan.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className={`relative flex h-full flex-col border-2 rounded-3xl overflow-hidden card-hover ${plan.popular
                    ? "border-[hsl(221,83%,53%)] shadow-lg dark:shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                    : "border-border/50 shadow-sm"
                  }`}>
                  {plan.popular && (
                    <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-[hsl(221,83%,53%)] via-[hsl(221,83%,43%)] to-[hsl(221,83%,53%)]" />
                  )}
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 bg-[hsl(221,83%,53%)] text-[hsl(222,47%,12%)] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        <Crown className="h-3 w-3" /> Best Value
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8 pb-4">
                    <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="font-serif text-5xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 px-8">
                    <ul className="space-y-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-[hsl(221,83%,53%)]/15 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 text-[hsl(221,83%,53%)] dark:text-primary" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="px-8 pb-8">
                    <Button
                      className={`w-full rounded-full h-12 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${plan.popular
                          ? "bg-[hsl(221,83%,53%)] text-[hsl(222,47%,12%)] hover:bg-[hsl(221,83%,48%)] shadow-md"
                          : ""
                        }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loadingPlanId !== null}
                    >
                      {loadingPlanId === plan.id ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Redirecting...
                        </span>
                      ) : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Exclusives */}
      {paidVideos.length > 0 && (
        <section className="py-20 bg-muted/50 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-[hsl(221,83%,53%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                <Sparkles className="h-4 w-4 inline mr-2" />PREMIUM CONTENT
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-3">Member Exclusives</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                All plans include full access to our paid library, including these popular classes.
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paidVideos.map((video, i) => {
                const thumb = getThumb(video);
                return (
                  <motion.div
                    key={video.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <div
                      className="group rounded-2xl overflow-hidden border border-border/50 bg-card card-hover cursor-pointer"
                      onMouseEnter={() => setHoveredId(video.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={video.title}
                            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <Play className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                        {/* Lock / Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: hoveredId === video.id ? 1 : 0.5,
                              opacity: hoveredId === video.id ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-14 h-14 rounded-full bg-[hsl(221,83%,53%)]/90 flex items-center justify-center shadow-2xl backdrop-blur-sm"
                          >
                            <Lock className="h-5 w-5 text-[hsl(222,47%,12%)]" />
                          </motion.div>
                        </div>

                        {/* Premium badge */}
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center gap-1.5 bg-[hsl(221,83%,53%)] text-[hsl(222,47%,12%)] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                            <Crown className="h-3 w-3" /> Premium
                          </span>
                        </div>

                        {/* Duration */}
                        {video.duration != null && video.duration > 0 && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {video.duration} min
                          </div>
                        )}

                        {/* Category */}
                        {video.category && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-white/90 dark:bg-black/60 dark:backdrop-blur-md dark:text-white text-[hsl(222,47%,12%)] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                              {video.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em]">
                            {[video.instructor, video.category].filter(Boolean).join(" · ") || "Premium Class"}
                          </p>
                        </div>
                        <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-primary transition-colors duration-300 mb-3">
                          {video.title}
                        </h3>
                        {video.instructor && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-border/30">
                              <span className="text-[9px] font-bold text-primary">{video.instructor[0]}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">with <span className="font-medium text-foreground/70">{video.instructor}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {paidVideos.length === 0 && (
        <section className="py-16 text-center px-6">
          <p className="text-muted-foreground">Subscribe to access premium classes.</p>
        </section>
      )}
    </div>
  );
};

export default Pricing;
