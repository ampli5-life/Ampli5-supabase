import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Play, Heart, ArrowRight, Clock, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  youtube_url?: string;
  instructor?: string;
  duration?: string;
  difficulty?: string;
  is_paid?: boolean;
  category?: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  publishedAt?: string;
  tag?: string;
  thumbnailUrl?: string;
}

interface Testimonial {
  id: string;
  text: string;
  author?: string;
  memberSince?: string;
}

const Index = () => {
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  useEffect(() => {
    Promise.all([
      api.get<Video[]>("/videos").catch(() => []),
      api.get<Testimonial[]>("/testimonials").catch(() => []),
    ]).then(([videos, test]) => {
      setFeaturedVideos(Array.isArray(videos) ? videos.filter((v) => !v.is_paid).slice(0, 3) : []);
      setTestimonials(Array.isArray(test) ? test : []);
    }).finally(() => setLoading(false));
  }, []);

  const fallbackVideos: Video[] = [
    { id: "1", title: "Morning Sunshine Flow", difficulty: "BEGINNER", duration: "25:00", instructor: "Sarah Jenkins", thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1440" },
    { id: "2", title: "Core Strength Builder", difficulty: "ADVANCED", duration: "45:00", instructor: "David Chen", thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1440" },
    { id: "3", title: "Evening Wind Down", difficulty: "ALL LEVELS", duration: "15:00", instructor: "Maya Ross", thumbnailUrl: "https://images.unsplash.com/photo-1552286450-4a669f880062?q=80&w=1440" },
  ];

  const effectiveVideos = featuredVideos.length > 0 ? featuredVideos : fallbackVideos;

  const fallbackTestimonials: Testimonial[] = [
    { id: "t1", text: "Ampli5 has completely transformed my morning routine. The instructors are incredibly knowledgeable and the variety of classes keeps me engaged every single day.", author: "Jessica M.", memberSince: "2022" },
    { id: "t2", text: "As a beginner, I was intimidated by yoga studios. This platform allowed me to learn at my own pace in the comfort of my home. The 'Basics' series is a game changer.", author: "Michael T.", memberSince: "2023" },
    { id: "t3", text: "The value for money is incredible. I used to pay $150/month for a studio membership. Now I get better variety and flexibility for a fraction of the cost.", author: "Sarah L.", memberSince: "2021" },
  ];
  const effectiveTestimonials = testimonials.length >= 3 ? testimonials.slice(0, 3) : fallbackTestimonials;

  const fallbackBlogPosts: BlogPost[] = [
    { id: "b1", title: "5 Minutes of Meditation a Day", excerpt: "Discover how micro-meditations can reset your nervous system.", tag: "MINDFULNESS", publishedAt: "Oct 12, 2023", thumbnailUrl: "https://images.unsplash.com/photo-1588286840104-b44d137baefb?q=80&w=800" },
    { id: "b2", title: "Post-Yoga Fueling Guide", excerpt: "What to eat after your practice to maximize recovery.", tag: "NUTRITION", publishedAt: "Oct 08, 2023", thumbnailUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800" },
    { id: "b3", title: "Creating a Home Sanctuary", excerpt: "Tips for carving out a peaceful corner for your wellness practice.", tag: "LIFESTYLE", publishedAt: "Sep 28, 2023", thumbnailUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800" },
  ];

  const categories = ["All", "Vinyasa", "Hatha", "Meditation", "Restorative"];

  // Thumbnail helpers (same logic as FreeVideos page)
  function extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
  }

  function getThumb(v: Video): string {
    const provided = v.thumbnailUrl || v.thumbnail_url;
    if (provided) return provided;
    const ytId = extractYouTubeId(v.youtube_url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <motion.div className="absolute inset-0 z-0" style={{ y: heroParallax }}>
          <img
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80"
            alt="Yoga on the beach"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </motion.div>

        {/* Floating accent orbs */}
        <div className="absolute top-1/4 left-[10%] w-72 h-72 bg-[hsl(71,95%,60%)]/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 mb-10"
          >
            <span className="flex items-center gap-2 uppercase tracking-[0.25em] text-xs font-semibold text-white/80 border border-white/20 rounded-full px-5 py-2.5 backdrop-blur-md bg-white/5">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(71,95%,60%)]" />
              NEW: ADVANCED VINYASA SERIES
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tight"
          >
            Amplify Your Life
            <br />
            <span className="text-[hsl(71,95%,60%)] italic">Through Yoga</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl mx-auto text-lg md:text-xl text-white/80 mt-8 mb-12 font-light leading-relaxed"
          >
            Expert-led classes for every level. Flow, stretch, and meditate — anytime, anywhere.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/pricing">
              <Button size="lg" className="rounded-full bg-[hsl(71,95%,60%)] text-[hsl(155,40%,12%)] hover:bg-[hsl(71,95%,55%)] px-10 h-14 text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(183,237,70,0.25)]">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/free-videos">
              <Button size="lg" variant="outline" className="rounded-full border-white/25 text-white hover:bg-white/10 px-10 h-14 text-base font-medium backdrop-blur-sm bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95">
                <Play className="mr-2 h-4 w-4 fill-current" /> Browse Classes
              </Button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
            >
              <motion.div className="w-1 h-2 rounded-full bg-white/80" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== VIDEO LIBRARY ===== */}
      <section className="py-28 px-6 relative">
        {/* Decorative blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[hsl(71,95%,60%)]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
              CURATED FOR YOU
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-4xl md:text-6xl font-bold">
              Video Library
            </motion.h2>
          </motion.div>

          {/* Category filters */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
            className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden
                    ${activeFilter === cat
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                >
                  {activeFilter === cat && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {cat}
                </button>
              ))}
            </div>
            <Link to="/free-videos" className="text-sm font-bold flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group">
              Explore Videos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Video grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {effectiveVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                  onMouseEnter={() => setHoveredVideo(video.id)}
                  onMouseLeave={() => setHoveredVideo(null)}
                >
                  <Link to={`/free-videos/${video.id}`} className="block">
                    {/* Thumbnail */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-5 bg-muted">
                      <img
                        src={getThumb(video)}
                        alt={video.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                      {/* Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 bg-white/95 dark:bg-black/60 dark:backdrop-blur-md dark:text-white text-[hsl(155,40%,12%)] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                          {video.difficulty || "ALL LEVELS"}
                        </span>
                      </div>

                      {/* Duration chip */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full">
                        <Clock className="h-3 w-3" />
                        {video.duration || "20:00"}
                      </div>

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: hoveredVideo === video.id ? 1 : 0.5,
                            opacity: hoveredVideo === video.id ? 1 : 0,
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="w-16 h-16 rounded-full bg-[hsl(71,95%,60%)]/90 flex items-center justify-center shadow-2xl backdrop-blur-sm"
                        >
                          <Play className="h-6 w-6 text-[hsl(155,40%,12%)] ml-0.5 fill-current" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="px-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[hsl(71,95%,60%)] dark:text-primary font-bold text-[11px] tracking-[0.2em] uppercase">
                          VINYASA FLOW
                        </span>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="text-muted-foreground hover:text-rose-500 transition-all duration-300 hover:scale-125 active:scale-90"
                        >
                          <Heart className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300 leading-snug">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-1 ring-border/50">
                          <span className="text-[10px] font-bold text-primary">{video.instructor?.[0] || "I"}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">with <span className="font-medium text-foreground/80">{video.instructor || "Instructor"}</span></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-28 bg-primary dark:bg-card text-primary-foreground dark:text-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(71,95%,60%)]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} custom={0} className="uppercase tracking-[0.3em] text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold mb-4 block">
              SIMPLE PROCESS
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-4xl md:text-6xl font-bold">
              How It Works
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 text-center">
            {[
              { num: 1, title: "Sign Up", desc: "Create your free account in less than 30 seconds. No credit card required.", active: true },
              { num: 2, title: "Choose a Plan", desc: "Select the membership that fits your lifestyle. Monthly or annual options.", active: false },
              { num: 3, title: "Stream Anywhere", desc: "Access unlimited classes on your phone, tablet, laptop or TV. Just press play.", active: false },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col items-center group"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-8 transition-all duration-500
                  ${step.active
                    ? 'border-2 border-[hsl(71,95%,60%)] text-[hsl(71,95%,60%)] bg-[hsl(71,95%,60%)]/10 shadow-[0_0_40px_rgba(183,237,70,0.2)] group-hover:shadow-[0_0_60px_rgba(183,237,70,0.35)]'
                    : 'border border-current/20 text-current/40 bg-current/5 group-hover:border-current/40 group-hover:text-current/60'
                  }`}
                >
                  {step.num}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">{step.title}</h3>
                <p className="opacity-70 leading-relaxed font-light max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
              TESTIMONIALS
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-4xl md:text-6xl font-bold">
              What Our Members Say
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {effectiveTestimonials.map((t, i) => (
              <motion.div
                key={t.id || i}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="h-full border rounded-3xl card-hover bg-card overflow-hidden group">
                  <CardContent className="p-8 relative">
                    {/* Quote mark */}
                    <div className="absolute top-4 right-6 text-7xl font-serif text-primary/8 leading-none select-none">"</div>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-6">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-[hsl(71,95%,60%)] text-[hsl(71,95%,60%)]" />
                      ))}
                    </div>
                    <p className="text-foreground/75 italic relative z-10 min-h-[100px] leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-border/30">
                        <img src={`https://i.pravatar.cc/150?u=${t.author}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{t.author}</p>
                        <p className="text-xs text-muted-foreground">Member since {t.memberSince || "2022"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="py-28 bg-muted/50 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <motion.span variants={fadeUp} custom={0} className="text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                INSIGHTS
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="font-serif text-4xl md:text-5xl font-bold">
                From the Blog
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-lg">
                Wellness tips, instructor stories, and community news.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/blog" className="text-sm font-bold flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group">
                Read the Blog
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {fallbackBlogPosts.map((post, i) => (
              <motion.div
                key={post.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group"
              >
                <div className="rounded-2xl overflow-hidden aspect-[16/10] mb-5 bg-muted">
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="px-1">
                  <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.2em] font-bold">
                    <span className="text-primary">{post.tag}</span>
                    <span className="text-muted-foreground">{post.publishedAt}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="text-sm font-bold text-primary flex items-center gap-1.5 group-hover:gap-3 transition-all duration-300">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-card" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[hsl(71,95%,60%)]/5 blur-[200px]" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-primary-foreground dark:text-foreground">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight"
          >
            Ready to deepen
            <br />
            your practice?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="opacity-70 text-lg md:text-xl mb-14 max-w-lg mx-auto"
          >
            Join thousands of members transforming their lives one breath at a time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/pricing">
              <Button size="lg" className="rounded-full bg-[hsl(71,95%,60%)] text-[hsl(155,40%,12%)] hover:bg-[hsl(71,95%,55%)] px-10 h-14 text-base font-bold shadow-[0_0_40px_rgba(183,237,70,0.25)] hover:shadow-[0_0_60px_rgba(183,237,70,0.4)] transition-all duration-300 hover:scale-105 active:scale-95">
                View Pricing Plans
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-full border-current/20 px-10 h-14 text-base font-bold backdrop-blur-sm bg-white/5 transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95">
                Contact Sales
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Index;
