import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { api, getVideoEmbedUrl, EmbedForbiddenError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, Play } from "lucide-react";

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
function extractYoutubeVideoId(url: string | null | undefined): string | null {
  const m = (url || "").trim().match(YOUTUBE_REGEX);
  return m ? m[1] : null;
}

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
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isDirectVideo, setIsDirectVideo] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(false);
  const [embedForbidden, setEmbedForbidden] = useState(false);

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

  const isPaid = video?.is_paid === true || (video as { isPaid?: boolean })?.isPaid === true;
  const canAttemptPlay = !isPaid || (!authLoading && isSubscribed);

  useEffect(() => {
    if (!id || !video || !canAttemptPlay) {
      setEmbedUrl(null);
      setEmbedForbidden(false);
      setEmbedLoading(false);
      return;
    }
    const ytUrl = video.youtube_url ?? (video as { youtubeUrl?: string }).youtubeUrl;
    if (!isPaid && ytUrl) {
      const ytId = extractYoutubeVideoId(ytUrl);
      if (ytId) {
        setEmbedUrl(`https://www.youtube.com/embed/${ytId}`);
        setIsDirectVideo(false);
        setEmbedForbidden(false);
        setEmbedLoading(false);
        return;
      }
    }
    if (!isPaid) {
      setEmbedUrl(null);
      setEmbedForbidden(false);
      setEmbedLoading(false);
      return;
    }
    setEmbedLoading(true);
    setEmbedForbidden(false);
    getVideoEmbedUrl(id, { sendAuth: true })
      .then((r) => {
        setEmbedUrl(r.embedUrl);
        setIsDirectVideo(r.isDirectVideo ?? false);
        setEmbedForbidden(false);
      })
      .catch((err) => {
        setEmbedUrl(null);
        setEmbedForbidden(err instanceof EmbedForbiddenError);
      })
      .finally(() => setEmbedLoading(false));
  }, [id, video, canAttemptPlay, isPaid]);

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

  const formatDuration = (d?: number) => (d != null ? `${d} min` : "—");
  const showLocked = isPaid && (!canAttemptPlay || embedForbidden);

  return (
    <div className="min-h-screen bg-background/95 pb-16 pt-20">
      {/* Hero Section for Player */}
      <div className="bg-slate-900 lg:py-10 py-4 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="container max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all gap-2"
              asChild
            >
              <Link to="/free-videos">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Videos</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                {video.category || "General"}
              </Badge>
              {isPaid && (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Premium Content
                </Badge>
              )}
            </div>
          </div>

          <div
            className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800/50"
            onContextMenu={(e) => e.preventDefault()}
          >
            {embedUrl ? (
              isDirectVideo ? (
                <video
                  src={embedUrl}
                  controls
                  className="h-full w-full object-contain"
                  title={video.title}
                  poster={video.thumbnail_url}
                />
              ) : (
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : embedLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg" />
                <p className="text-slate-400 font-medium animate-pulse text-lg">Preparing your session...</p>
              </div>
            ) : showLocked ? (
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={video.thumbnail_url ?? (video as { thumbnailUrl?: string }).thumbnailUrl ?? ""}
                  alt={video.title}
                  className="h-full w-full object-cover opacity-60 blur-[2px]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <div className="max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-amber-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                      <Lock className="h-10 w-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Premium Content</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                      This exclusive video is reserved for our subscribers. Join our community to unlock full access to our yoga library.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button size="lg" className="w-full sm:w-auto px-10 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95" asChild>
                        <Link to="/pricing">Unlock Now</Link>
                      </Button>
                      {!profile && (
                        <Button variant="ghost" size="lg" className="w-full sm:w-auto text-slate-300 hover:text-white" asChild>
                          <Link to="/login">Member Login</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-950 p-8 text-center">
                <div className="bg-slate-900 p-4 rounded-full mb-2">
                  <Play className="h-10 w-10 text-slate-700" />
                </div>
                <p className="text-slate-400 font-medium text-lg">Unable to play this session</p>
                <p className="text-slate-500 max-w-sm text-sm">
                  {!isPaid
                    ? "We couldn't find the source for this free session. Please let us know so we can fix it."
                    : "The video stream is currently unavailable. Please try again later."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="animate-in slide-in-from-bottom-5 duration-500">
              <div className="flex items-center gap-3 text-primary mb-2">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <span className="text-sm font-bold uppercase tracking-wider">Now Playing</span>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
                {video.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-muted rounded-md"><Play className="h-4 w-4" /></div>
                  <span>{formatDuration(video.duration)} Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-muted rounded-md"><Badge className="h-4 w-4 bg-transparent p-0 text-muted-foreground"><Lock className="h-3 w-3" /></Badge></div>
                  <span>{isPaid ? "Premium Access" : "Free Public Session"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Instructor:</span>
                  <span>{video.instructor || "Yoga Team"}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none animate-in fade-in duration-700 delay-200">
              <h3 className="text-xl font-bold mb-4 text-foreground/90">About this session</h3>
              <p className="leading-relaxed text-lg text-foreground/70 whitespace-pre-wrap">
                {video.description || "No description available for this session. Join us as we explore the mindful practice of yoga and wellness."}
              </p>
            </div>

            {/* In-Body Related for Mobile */}
            <div className="lg:hidden animate-in fade-in duration-700 delay-300 pt-8 border-t border-border">
              <h2 className="font-serif text-2xl font-bold mb-6">More from this collection</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link key={r.id} to={`/free-videos/${r.id}`} className="group">
                    <Card className="overflow-hidden border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={r.thumbnail_url || ""}
                          alt={r.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{r.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{formatDuration(r.duration)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-10 animate-in slide-in-from-right-10 duration-700">
            <div className="sticky top-24">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold tracking-tight">Up Next</h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-[0.2em]">Queue</Badge>
              </div>
              <div className="space-y-4">
                {related.map((rv) => (
                  <Link key={rv.id} to={`/free-videos/${rv.id}`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg shadow-sm">
                      <img
                        src={rv.thumbnail_url || ""}
                        alt={rv.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 py-1">
                      <h4 className="line-clamp-2 text-sm font-bold leading-tight group-hover:text-primary transition-colors">{rv.title}</h4>
                      <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                        <Play className="h-3 w-3 inline" /> {formatDuration(rv.duration)}
                      </p>
                    </div>
                  </Link>
                ))}
                {related.length === 0 && (
                  <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed text-muted-foreground">
                    <p className="text-sm">Explore our catalog for more wellness sessions.</p>
                  </div>
                )}
              </div>

              {/* Promo Card */}
              <Card className="mt-12 overflow-hidden border-0 bg-primary/5 shadow-inner">
                <CardContent className="p-6 text-center">
                  <h4 className="font-bold text-lg mb-2">Want full access?</h4>
                  <p className="text-sm text-muted-foreground mb-4">Subscribe to our Gold plan for ad-free experience and exclusive content.</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/pricing">View Plans</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeVideoDetail;
