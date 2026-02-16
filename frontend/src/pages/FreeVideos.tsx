import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Play, Search } from "lucide-react";

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
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    api.get<Video[]>("/videos").then((data) => setVideos(Array.isArray(data) ? data : [])).catch(() => []).finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set((videos || []).map((v) => v.category).filter(Boolean) as string[]))];
  const filtered = videos.filter((v) => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== "All" && v.category !== selectedCategory) return false;
    return true;
  });

  const formatDuration = (d?: number) => (d != null ? `${d} min` : "—");
  const thumb = (v: Video) => v.thumbnailUrl || v.thumbnail_url || "";
  const isPaid = (v: Video) => v.is_paid === true || (v as { isPaid?: boolean }).isPaid === true;

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
                    <img src={thumb(video)} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                      <Play className="h-12 w-12 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {isPaid(video) && (
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-foreground/80 px-2 py-1 text-primary-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-xs font-medium">Locked</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 right-3 rounded bg-foreground/70 px-2 py-0.5 text-xs text-primary-foreground">{formatDuration(video.duration)}</span>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{[video.instructor, video.category].filter(Boolean).join(" · ") || "—"}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold leading-snug hover:text-primary">
                      {video.title}
                    </h3>
                    {isPaid(video) && (
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
