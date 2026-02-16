import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  youtube_url?: string;
  is_paid?: boolean;
  category?: string;
  duration?: number;
  instructor?: string;
}

const FreeVideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.get<Video>(`/videos/${id}`).catch(() => null),
      api.get<Video[]>("/videos").then((list) => Array.isArray(list) ? list : []),
    ]).then(([v, list]) => {
      setVideo(v || null);
      if (v) {
        setRelated(list.filter((x) => x.id !== v.id && x.category === v.category).slice(0, 3));
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Video not found</h1>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/free-videos"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Videos</Link>
        </Button>
      </div>
    );
  }

  const youtubeId = video.youtube_url?.split("v=")[1]?.split("&")[0];
  const formatDuration = (d?: number) => (d != null ? `${Math.floor(d / 60)} min` : "—");

  return (
    <div className="py-8">
      <div className="container">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/free-videos"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Videos</Link>
        </Button>

        {/* Player */}
        <div className="aspect-video overflow-hidden rounded-lg bg-foreground/5">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Video unavailable</div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="font-serif text-3xl font-bold">{video.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {video.category && <Badge variant="outline">{video.category}</Badge>}
              <span className="text-sm text-muted-foreground">{formatDuration(video.duration)}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Instructor: {video.instructor || "—"}</p>
            <p className="mt-4 leading-relaxed text-foreground/80">{video.description || ""}</p>
            {related.length > 0 && (
            <div className="mt-6">
              <h2 className="font-serif text-xl font-semibold mb-3">Related</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Card key={r.id} className="overflow-hidden border-0 shadow-sm">
                    <Link to={`/free-videos/${r.id}`}>
                      <div className="aspect-video overflow-hidden">
                        <img src={r.thumbnail_url || ""} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2">{r.title}</h3>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
            )}
          </div>

          {/* Related */}
          <div>
            <h3 className="mb-4 font-serif text-xl font-semibold">Related Videos</h3>
            <div className="space-y-4">
              {related.map((rv) => (
                <Card key={rv.id} className="group overflow-hidden border-0 shadow-sm">
                  <Link to={`/free-videos/${rv.id}`} className="flex gap-3 p-2">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded">
                      <img src={rv.thumbnail_url || ""} alt={rv.title} className="h-full w-full object-cover" loading="lazy" />
                      <Play className="absolute inset-0 m-auto h-6 w-6 text-primary-foreground opacity-70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{formatDuration(rv.duration)}</p>
                      <h4 className="line-clamp-2 text-sm font-medium leading-snug">{rv.title}</h4>
                    </div>
                  </Link>
                </Card>
              ))}
              {related.length === 0 && <p className="text-sm text-muted-foreground">No related videos yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeVideoDetail;
