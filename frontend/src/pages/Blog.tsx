import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  tag?: string;
  publishedAt?: string;
  slug?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

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
      excerpt: "Practical tips to weave yoga into real life — not the perfect schedule.",
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
            Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-primary-foreground/70 dark:text-foreground/60 text-lg max-w-xl mx-auto"
          >
            Insights, tips, and inspiration for your yoga journey.
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-12 flex flex-col gap-5 md:flex-row md:items-center"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-full border-border/50 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                    ${selectedCategory === cat
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
                  {filtered.map((post, i) => (
                    <motion.div
                      key={post.id}
                      layout
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.95 }}
                      variants={fadeUp}
                    >
                      <Link to={`/blog/${post.slug || post.id}`} className="block group">
                        <Card className="h-full overflow-hidden rounded-2xl border card-hover bg-card">
                          <CardContent className="p-7">
                            {/* Tag */}
                            {post.tag && (
                              <span className="inline-block text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-4">
                                {post.tag}
                              </span>
                            )}

                            <h3 className="font-serif text-xl font-bold leading-snug group-hover:text-primary transition-colors duration-300 mb-3">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              {post.publishedAt && (
                                <span className="text-xs text-muted-foreground/60">{post.publishedAt}</span>
                              )}
                              <span className="text-sm font-bold text-primary flex items-center gap-1.5 group-hover:gap-3 transition-all duration-300 ml-auto">
                                Read <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg">No blog posts found.</p>
                  <button
                    onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
