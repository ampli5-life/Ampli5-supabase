import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Play, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

  useEffect(() => {
    // Use direct REST API fetch to bypass Supabase JS client auth session hangs.
    // Videos have a public RLS policy (USING true) so no auth is needed.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(`${supabaseUrl}/rest/v1/videos?select=*&order=created_at.asc`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setVideos([]))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const categories = ["All", ...Array.from(new Set((videos || []).map((v) => v.category).filter(Boolean) as string[]))];
  const filtered = videos.filter((v) => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== "All" && v.category !== selectedCategory) return false;
    return true;
  });

  const formatDuration = (d?: number) => (d != null && d > 0 ? `${d} min` : "");
  const isPaid = (v: Video) => v.is_paid === true || (v as { isPaid?: boolean }).isPaid === true;

  /** Extract YouTube video ID from various URL formats */
  function extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  /** Get thumbnail: provided > YouTube auto > gradient placeholder */
  function getThumb(v: Video): { url: string | null; isPlaceholder: boolean } {
    const provided = v.thumbnailUrl || v.thumbnail_url;
    if (provided) return { url: provided, isPlaceholder: false };
    const ytId = extractYouTubeId(v.youtube_url);
    if (ytId) return { url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`, isPlaceholder: false };
    return { url: null, isPlaceholder: true };
  }

  /** Gradient colors based on video title (deterministic) */
  function placeholderGradient(title: string): string {
    const gradients = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-600",
      "from-orange-400 to-rose-500",
      "from-pink-500 to-fuchsia-600",
      "from-indigo-500 to-blue-600",
      "from-amber-400 to-orange-500",
      "from-teal-400 to-emerald-500",
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  }

  return (
    <>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Video Library</h1>
          <p className="mx-auto mt-4 max-w-xl opacity-90">Explore our collection of yoga classes and resources — free and premium.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((video) => (
                  <Link key={video.id} to={`/free-videos/${video.id}`} state={{ video }} className="block">
                    <Card className="group overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                      <div className="relative aspect-video overflow-hidden">
                        {(() => {
                          const t = getThumb(video);
                          if (!t.isPlaceholder && t.url) {
                            return (
                              <img src={t.url} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                            );
                          }
                          return (
                            <div className={`h-full w-full bg-gradient-to-br ${placeholderGradient(video.title)} flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                              <Play className="h-14 w-14 text-white/80 mb-2" />
                              <span className="text-white/90 text-sm font-medium px-4 text-center line-clamp-2">{video.title}</span>
                            </div>
                          );
                        })()}
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                          <Play className="h-12 w-12 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        {isPaid(video) && !isSubscribed && (
                          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-foreground/80 px-2 py-1 text-primary-foreground">
                            <Lock className="h-4 w-4" />
                            <span className="text-xs font-medium">Locked</span>
                          </div>
                        )}
                        {formatDuration(video.duration) && (
                          <span className="absolute bottom-3 right-3 rounded bg-foreground/70 px-2 py-0.5 text-xs text-primary-foreground">{formatDuration(video.duration)}</span>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{[video.instructor, video.category].filter(Boolean).join(" · ") || "—"}</p>
                        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug hover:text-primary">
                          {video.title}
                        </h3>
                        {isPaid(video) && !isSubscribed && (
                          <Button asChild className="mt-3 w-full" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Link to="/pricing" onClick={(e) => e.stopPropagation()}>Subscribe</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <p>No videos found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default FreeVideos;
