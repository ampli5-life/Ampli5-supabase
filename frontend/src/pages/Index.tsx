import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Play, Star, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructor?: string;
  duration?: string;
  difficulty?: string;
  is_paid?: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  publishedAt?: string;
  tag?: string;
}

interface Testimonial {
  id: string;
  text: string;
  author?: string;
}

const Index = () => {
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const dataPromise = Promise.all([
      api.get<Video[]>("/videos").catch(() => []),
      api.get<BlogPost[]>("/blog").catch(() => []),
      api.get<Testimonial[]>("/testimonials").catch(() => []),
    ]);
    dataPromise.then((result) => {
      const [videos, blog, test] = result;
      setFeaturedVideos(Array.isArray(videos) ? videos.filter((v) => !v.is_paid).slice(0, 3) : []);
      setBlogPosts(Array.isArray(blog) ? blog.slice(0, 3) : []);
      setTestimonials(Array.isArray(test) ? test : []);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const fallbackVideos: Video[] = [
    { id: "1", title: "Morning Sunshine Flow", difficulty: "BEGINNER", duration: "25:00", instructor: "Sarah Jenkins", thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1440" },
    { id: "2", title: "Core Strength Builder", difficulty: "ADVANCED", duration: "45:00", instructor: "David Chen", thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1440" },
    { id: "3", title: "Evening Wind Down", difficulty: "ALL LEVELS", duration: "15:00", instructor: "Maya Ross", thumbnailUrl: "https://images.unsplash.com/photo-1552286450-4a669f880062?q=80&w=1440" }
  ];

  const effectiveVideos = featuredVideos.length > 0 ? featuredVideos : fallbackVideos;

  const fallbackTestimonials = [
    { id: "t1", text: "Ampli5 has completely transformed my morning routine. The instructors are incredibly knowledgeable and the variety of classes keeps me engaged every single day.", author: "Jessica M.", memberSince: "2022" },
    { id: "t2", text: "As a beginner, I was intimidated by yoga studios. This platform allowed me to learn at my own pace in the comfort of my home. The 'Basics' series is a game changer.", author: "Michael T.", memberSince: "2023" },
    { id: "t3", text: "The value for money is incredible. I used to pay $150/month for a studio membership. Now I get better variety and flexibility for a fraction of the cost.", author: "Sarah L.", memberSince: "2021" }
  ];
  const effectiveTestimonials = testimonials.length >= 3 ? testimonials.slice(0, 3) : fallbackTestimonials;
  
  const fallbackBlogPosts = [
    { id: "b1", title: "5 Minutes of Meditation a Day", excerpt: "You don't need an hour of silence. Discover how micro-meditations can reset your nervous system.", tag: "MINDFULNESS", publishedAt: "Oct 12, 2023", thumbnailUrl: "https://images.unsplash.com/photo-1588286840104-b44d137baefb?q=80&w=800" },
    { id: "b2", title: "Post-Yoga Fueling Guide", excerpt: "What to eat after your practice to maximize recovery and sustain energy levels throughout the day.", tag: "NUTRITION", publishedAt: "Oct 08, 2023", thumbnailUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800" },
    { id: "b3", title: "Creating a Home Sanctuary", excerpt: "Tips for carving out a peaceful corner in your home dedicated to your wellness practice.", tag: "LIFESTYLE", publishedAt: "Sep 28, 2023", thumbnailUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800" }
  ];

  const categories = ["All", "Vinyasa", "Hatha", "Meditation", "Restorative"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-16 px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80" 
            alt="Yoga on the beach" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-background/90" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center mt-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="uppercase tracking-[0.2em] text-xs font-semibold text-white/90 border border-white/30 rounded-full px-6 py-2 backdrop-blur-sm bg-white/10 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              NEW: ADVANCED VINYASA SERIES
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight"
          >
            Amplify Your Life <br />
            <span className="text-secondary italic">Through Yoga</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-10 font-light"
          >
            Expert-led classes for every level. Flow, stretch, and meditate — anytime, anywhere. Join a community dedicated to mindful living.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="rounded-full bg-secondary text-primary hover:bg-secondary/90 px-8 py-6 text-lg font-semibold transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,248,68,0.3)]">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-medium transition-all hover:scale-105 backdrop-blur-sm bg-black/20">
              <Play className="mr-2 h-5 w-5 fill-current" /> Browse Classes
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Ampli5 / Video Library */}
      <section className="py-24 px-4 bg-background relative z-20 -mt-10 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl md:text-5xl font-bold text-primary"
            >
              Video Library
            </motion.h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === cat 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-muted text-foreground/70 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Link to="/videos" className="text-sm font-semibold flex items-center gap-1 hover:text-primary transition-colors hover:underline underline-offset-4">
              Explore All 200+ Videos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {effectiveVideos.map((video, idx) => (
                <motion.div 
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {video.difficulty || "ALL LEVELS"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md">
                      {video.duration || "20:00"}
                    </div>
                    
                    {/* Hover Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-secondary/90 flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-6 w-6 text-primary ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-secondary font-bold text-xs tracking-widest uppercase">
                        {(video as any).category || "VINYASA FLOW"}
                      </span>
                      <button className="text-muted-foreground hover:text-rose-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] font-bold text-primary">{video.instructor?.[0] || "I"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">with {video.instructor || "Instructor"}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="uppercase tracking-widest text-secondary text-sm font-semibold mb-3 block">Simple Process</span>
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl md:text-6xl font-bold"
            >
              How It Works
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { num: 1, title: "Sign Up", desc: "Create your free account in less than 30 seconds. No credit card required for free tier.", active: true },
              { num: 2, title: "Choose a Plan", desc: "Select the membership that fits your lifestyle. Monthly or annual options available.", active: false },
              { num: 3, title: "Stream Anywhere", desc: "Access unlimited classes on your phone, tablet, laptop or TV. Just press play.", active: false }
            ].map((step, i) => (
              <motion.div 
                key={step.num}
                custom={i+1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex flex-col items-center"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-6 transition-all duration-500
                  ${step.active ? 'border-2 border-secondary text-secondary bg-secondary/10 shadow-[0_0_30px_rgba(212,248,68,0.2)]' : 'border border-white/20 text-white/50 bg-white/5'}`}
                >
                  {step.num}
                </div>
                <h3 className="text-2xl font-serif font-semibold mb-4">{step.title}</h3>
                <p className="text-white/70 leading-relaxed font-light">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4"
            >
              What Our Members Say
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {effectiveTestimonials.map((t, i) => (
              <motion.div 
                key={t.id || i} 
                custom={i+1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              >
                <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white overflow-hidden group">
                  <CardContent className="p-8 relative">
                    <span className="absolute top-6 left-6 text-6xl text-primary/10 font-serif leading-none rotate-180">"</span>
                    <p className="text-foreground/80 italic relative z-10 mt-6 min-h-[120px] font-light leading-relaxed">"{t.text}"</p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                        <img src={`https://i.pravatar.cc/150?u=${t.author}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-primary">{t.author}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Member since {(t as any).memberSince || "2022"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wellness Literature / Blog */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4"
            >
              From the Blog
            </motion.h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Wellness tips, instructor stories, and community news.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fallbackBlogPosts.map((post, i) => (
              <motion.div 
                key={post.id} 
                custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group cursor-pointer"
              >
                <div className="rounded-3xl overflow-hidden aspect-[16/10] mb-5">
                  <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-2">
                  <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-widest font-semibold">
                    <span className="text-primary">{post.tag}</span>
                    <span className="text-muted-foreground">{post.publishedAt}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        {/* Hexagon Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M54.627 0l.83.477-27.14 47.01-27.14-47.01.83-.477L28.317 45.41l1.366-2.366L6.5 6.5h47l-23.18 40.15 1.366 2.365zM28.318 0l27.14 47.008-.83.48-26.31-45.564-26.31 45.564-.83-.48L28.318 0z\\' fill=\\'%23ffffff\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')" }} />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl font-bold mb-6"
          >
            Ready to deepen your practice?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/70 text-lg md:text-xl mb-12"
          >
            Join thousands of members who are transforming their lives one breath at a time.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="rounded-full bg-secondary text-primary hover:bg-secondary/90 px-8 py-6 text-lg font-bold w-full sm:w-auto shadow-[0_0_20px_rgba(212,248,68,0.3)]">
              View Pricing Plans
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-bold w-full sm:w-auto backdrop-blur-sm">
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Index;
