import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Play, Search, Clock, Heart, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  youtube_url?: string;
  is_paid?: boolean;
  category?: string;
  duration?: number;
  instructor?: string;
}

const FreeVideos = () => {
  const { isSubscribed } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(`${supabaseUrl}/rest/v1/videos?select=*&order=created_at.asc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setVideos([]))
      .finally(() => { clearTimeout(timeout); setLoading(false); });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const isPaid = (v: Video) => v.is_paid === true || (v as { isPaid?: boolean }).isPaid === true;
  const formatDuration = (d?: number) => (d != null && d > 0 ? `${d} min` : "");

  const predefinedFilters = ["All", "Free", "Paid", "Beginner", "Intermediate", "Advanced"];
  const dynamicCategories = Array.from(new Set((videos || []).map((v) => v.category).filter(Boolean) as string[]));
  const otherCategories = dynamicCategories.filter(c => !predefinedFilters.map(f => f.toLowerCase()).includes(c.toLowerCase()));
  const filterOptions = [...predefinedFilters, ...otherCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1))];

  const filtered = videos.filter((v) => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== "All") {
      const lowerFilter = selectedCategory.toLowerCase();
      if (lowerFilter === "free" && isPaid(v)) return false;
      else if (lowerFilter === "paid" && !isPaid(v)) return false;
      else if (lowerFilter !== "free" && lowerFilter !== "paid" && (v.category || "").toLowerCase() !== lowerFilter) return false;
    }
    return true;
  });

  function extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
  }

  function getThumb(v: Video): { url: string | null; isPlaceholder: boolean } {
    const provided = v.thumbnailUrl || v.thumbnail_url;
    if (provided) return { url: provided, isPlaceholder: false };
    const ytId = extractYouTubeId(v.youtube_url);
    if (ytId) return { url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`, isPlaceholder: false };
    return { url: null, isPlaceholder: true };
  }

  function placeholderGradient(title: string): string {
    const gradients = [
      "from-violet-500 to-purple-600", "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-600", "from-orange-400 to-rose-500",
      "from-pink-500 to-fuchsia-600", "from-indigo-500 to-blue-600",
      "from-amber-400 to-orange-500", "from-teal-400 to-emerald-500",
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-card" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(71,95%,60%)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/3 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground dark:text-foreground mb-4"
          >
            Video Library
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-primary-foreground/70 dark:text-foreground/60 text-lg max-w-xl mx-auto"
          >
            Explore our collection of yoga classes and resources — free and premium.
          </motion.p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10 flex flex-col gap-5 md:flex-row md:items-center"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-full border-border/50 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
              {filterOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                    ${selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
                <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-primary/20" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((video, idx) => {
                    const thumb = getThumb(video);
                    return (
                      <motion.div
                        key={video.id}
                        layout
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={`/free-videos/${video.id}`}
                          state={{ video }}
                          className="block group"
                          onMouseEnter={() => setHoveredId(video.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          {/* Card */}
                          <div className="rounded-2xl overflow-hidden border border-border/50 bg-card card-hover">
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden bg-muted">
                              {!thumb.isPlaceholder && thumb.url ? (
                                <img
                                  src={thumb.url}
                                  alt={video.title}
                                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                                  loading="lazy"
                                />
                              ) : (
                                <div className={`h-full w-full bg-gradient-to-br ${placeholderGradient(video.title)} flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105`}>
                                  <Play className="h-12 w-12 text-white/80 mb-2" />
                                  <span className="text-white/90 text-sm font-medium px-4 text-center line-clamp-2">{video.title}</span>
                                </div>
                              )}

                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Play button overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  initial={false}
                                  animate={{
                                    scale: hoveredId === video.id ? 1 : 0.5,
                                    opacity: hoveredId === video.id ? 1 : 0,
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className="w-14 h-14 rounded-full bg-[hsl(71,95%,60%)]/90 flex items-center justify-center shadow-2xl backdrop-blur-sm"
                                >
                                  <Play className="h-5 w-5 text-[hsl(155,40%,12%)] ml-0.5 fill-current" />
                                </motion.div>
                              </div>

                              {/* Paid badge */}
                              {isPaid(video) && !isSubscribed && (
                                <div className="absolute left-3 top-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white">
                                  <Lock className="h-3.5 w-3.5" />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Premium</span>
                                </div>
                              )}

                              {/* Duration */}
                              {formatDuration(video.duration) && (
                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(video.duration)}
                                </div>
                              )}

                              {/* Category badge */}
                              {video.category && (
                                <div className="absolute top-3 right-3">
                                  <span className="bg-white/90 dark:bg-black/60 dark:backdrop-blur-md dark:text-white text-[hsl(155,40%,12%)] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                    {video.category}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em]">
                                  {[video.instructor, video.category].filter(Boolean).join(" · ") || "Yoga Class"}
                                </p>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="text-muted-foreground hover:text-rose-500 transition-all duration-300 hover:scale-125 active:scale-90"
                                >
                                  <Heart className="h-4 w-4" />
                                </button>
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
                              {isPaid(video) && !isSubscribed && (
                                <Button asChild className="mt-4 w-full rounded-full h-10 font-bold bg-[hsl(71,95%,60%)] text-[hsl(155,40%,12%)] hover:bg-[hsl(71,95%,55%)]" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <Link to="/pricing" onClick={(e) => e.stopPropagation()}>Subscribe to Unlock</Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg">No videos found matching your filters.</p>
                  <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default FreeVideos;
