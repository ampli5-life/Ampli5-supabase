import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  tag?: string;
  publishedAt?: string;
  slug?: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    api.get<BlogPost[]>("/blog").then((data) => setPosts(Array.isArray(data) ? data : [])).catch(() => []).finally(() => setLoading(false));
  }, []);

  const fallbackPosts: BlogPost[] = [
    {
      id: "morning-stretches",
      title: "5 Morning Stretches for a Softer Start",
      excerpt: "A short sequence you can do next to your bed to gently wake up joints and muscles.",
      tag: "Beginners",
    },
    {
      id: "breathing-matters",
      title: "Why Breathing Matters More Than the Pose",
      excerpt: "Learn how simple breath awareness can change the way every practice feels.",
      tag: "Mindfulness",
    },
    {
      id: "home-practice",
      title: "Building a Home Practice That Sticks",
      excerpt: "Practical tips to weave yoga into real life—not the perfect schedule.",
      tag: "Lifestyle",
    },
  ];

  const sourcePosts = posts.length > 0 ? posts : fallbackPosts;
  const categories = ["All", ...Array.from(new Set((sourcePosts || []).map((p) => p.tag).filter(Boolean) as string[]))];
  const filtered = sourcePosts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== "All" && p.tag !== selectedCategory) return false;
    return true;
  });

  return (
    <>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Blog</h1>
          <p className="mx-auto mt-4 max-w-xl opacity-90">Insights, tips, and inspiration for your yoga journey.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)}>
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
                {filtered.map((post) => (
                  <Card key={post.id} className="group overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{post.publishedAt || post.tag || ""}</p>
                      <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">
                        <Link to={`/blog/${post.slug || post.id}`} className="hover:text-primary">{post.title}</Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt || ""}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">No posts found.</div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
