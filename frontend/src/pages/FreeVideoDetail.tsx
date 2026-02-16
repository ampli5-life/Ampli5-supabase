import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, Play } from "lucide-react";

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
  const location = useLocation();
  const { profile, isSubscribed, loading: authLoading } = useAuth();
  const stateVideo = (location.state as { video?: Video } | null)?.video ?? null;
  const stateMatchesId = stateVideo?.id === id;
  const [video, setVideo] = useState<Video | null>(() => (stateMatchesId ? stateVideo : null));
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(!stateMatchesId);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.get<Video>(`/videos/${id}`).catch(() => null),
      api.get<Video[]>("/videos").then((list) => Array.isArray(list) ? list : []),
    ]).then(([v, list]) => {
      const current = v ?? (stateVideo?.id === id ? stateVideo : null);
      setVideo(current);
      if (current) {
        setRelated(list.filter((x) => x.id !== current.id && x.category === current.category).slice(0, 3));
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

  const youtubeUrl = video.youtube_url ?? (video as { youtubeUrl?: string }).youtubeUrl ?? "";
  const youtubeId = (() => {
    if (!youtubeUrl || !youtubeUrl.trim()) return null;
    const trimmed = youtubeUrl.trim();
    const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  })();
  const formatDuration = (d?: number) => (d != null ? `${d} min` : "—");
  const isPaid = video.is_paid === true || (video as { isPaid?: boolean }).isPaid === true;
  const canPlay = !isPaid || (!authLoading && isSubscribed);

  return (
    <div className="py-8">
      <div className="container">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/free-videos"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Videos</Link>
        </Button>

        {/* Player */}
        <div className="aspect-video overflow-hidden rounded-lg bg-foreground/5">
          {canPlay && youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isPaid && !canPlay ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">This is a premium video. Subscribe to watch.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild>
                  <Link to="/pricing">View plans</Link>
                </Button>
                {!profile && (
                  <Button variant="outline" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-center text-muted-foreground">
              <p>This video cannot be played here.</p>
              {youtubeUrl ? (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Open in YouTube
                </a>
              ) : (
                <p className="text-sm">No video link is set for this content.</p>
              )}
            </div>
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
