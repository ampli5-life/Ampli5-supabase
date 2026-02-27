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
    <div className="min-h-screen bg-background pb-20 pt-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-28 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(199,89%,48%)]/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(199,89%,48%)]/10 border border-[hsl(199,89%,48%)]/20 text-[hsl(199,89%,48%)] text-[10px] uppercase font-bold tracking-widest mb-6">
              <Play className="h-3 w-3 fill-current" />
              Experience Wellness
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
              Our Video <span className="text-[hsl(199,89%,48%)] italic">Library</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              From invigorating flows to deep meditations. Explore our curated collection
              designed to support your journey at every stage.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filters sticky header */}
          <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md py-4 mb-12 -mx-6 px-6 border-b border-border/40">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col xl:flex-row gap-6 items-center justify-between"
            >
              <div className="relative w-full xl:max-w-md group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Find a session (e.g., 'Morning Flow', 'Vinyasa')..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-14 rounded-2xl border-border/50 bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base shadow-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-center">
                <div className="h-10 px-3 flex items-center gap-2 border-r border-border mr-2 hidden lg:flex">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter</span>
                </div>
                {filterOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300
                      ${selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/50'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary shadow-inner" />
                <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-primary/20" />
              </div>
              <p className="text-muted-foreground font-medium animate-pulse">Curating your sessions...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((video, idx) => {
                    const thumb = getThumb(video);
                    const videoIsPaid = isPaid(video);
                    return (
                      <motion.div
                        key={video.id}
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={`/free-videos/${video.id}`}
                          state={{ video }}
                          className="block group h-full"
                          onMouseEnter={() => setHoveredId(video.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-card border border-border/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 group-hover:-translate-y-2">
                            {/* Thumbnail Container */}
                            <div className="relative aspect-video overflow-hidden bg-slate-900">
                              {!thumb.isPlaceholder && thumb.url ? (
                                <img
                                  src={thumb.url}
                                  alt={video.title}
                                  className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-50"
                                  loading="lazy"
                                />
                              ) : (
                                <div className={`h-full w-full bg-gradient-to-br ${placeholderGradient(video.title)} flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
                                  <Play className="h-14 w-14 text-white/50 mb-2" />
                                </div>
                              )}

                              {/* Overlays */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Hover Play Button */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                  initial={false}
                                  animate={{
                                    scale: hoveredId === video.id ? 1 : 0.6,
                                    opacity: hoveredId === video.id ? 1 : 0,
                                  }}
                                  className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl"
                                >
                                  <Play className="h-6 w-6 fill-current ml-1" />
                                </motion.div>
                              </div>

                              {/* Badges */}
                              <div className="absolute inset-x-4 top-4 flex justify-between items-start">
                                {videoIsPaid && !isSubscribed ? (
                                  <div className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-lg">
                                    <Lock className="h-3 w-3" />
                                    Premium
                                  </div>
                                ) : (
                                  <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-lg">
                                    Unlock
                                  </div>
                                )}

                                {video.category && (
                                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">
                                    {video.category}
                                  </div>
                                )}
                              </div>

                              {/* Duration info */}
                              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90">
                                <div className="p-1 px-2 rounded-md bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] font-bold flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(video.duration) || "Full Class"}
                                </div>
                              </div>
                            </div>

                            {/* Info Content */}
                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex-1">
                                <h3 className="font-serif text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                  {video.title}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 font-light">
                                  {video.description || "Join us for this transformative yoga session designed to balance mind and body."}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-background shadow-sm overflow-hidden">
                                    <span className="text-[10px] font-bold text-muted-foreground">{video.instructor ? video.instructor[0] : "Y"}</span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Instructor</p>
                                    <p className="text-xs font-bold text-foreground/90">{video.instructor || "Yoga Academy"}</p>
                                  </div>
                                </div>
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors">
                                  <Heart className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="py-32 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6 border border-dashed border-border/60">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No matching sessions</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-light">
                    We couldn't find any videos matching your current filters. Try adjusting your search or category.
                  </p>
                  <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
                    Reset All Filters
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
