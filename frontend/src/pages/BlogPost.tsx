import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface BlogPostType {
  id: string;
  title: string;
  excerpt?: string;
  tag?: string;
  publishedAt?: string;
  slug?: string;
  content?: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [related, setRelated] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<BlogPostType[]>("/blog")
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        const found = arr.find((p) => p.slug === slug || p.id === slug) ?? null;
        setPost(found ?? null);
        if (found) {
          setRelated(arr.filter((p) => p.id !== found.id && p.tag === found.tag).slice(0, 3));
        }
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Post not found</h1>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/blog"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="py-8">
      <div className="container max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/blog"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog</Link>
        </Button>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{post.publishedAt || ""}</span>
            {post.tag && (
              <>
                <span>·</span>
                <Badge variant="secondary">{post.tag}</Badge>
              </>
            )}
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}

          <div className="prose prose-lg mt-8 max-w-none text-foreground/80">
            <p>{post.content || post.excerpt || ""}</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="mb-6 font-serif text-2xl font-bold">Related Posts</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Card key={rp.id} className="group overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-serif text-lg font-semibold leading-snug">
                      <Link to={`/blog/${rp.slug || rp.id}`} className="hover:text-primary">{rp.title}</Link>
                    </h3>
                    {rp.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{rp.excerpt}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogPost;
