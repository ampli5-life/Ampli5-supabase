import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Play, Star, Users, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructor?: string;
  duration?: string;
  difficulty?: string;
  is_paid?: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  publishedAt?: string;
  tag?: string;
}

interface Testimonial {
  id: string;
  text: string;
  author?: string;
}

interface Book {
  title: string;
  author: string;
  description: string;
  url?: string;
}

async function fetchPageContent(key: string): Promise<string | null> {
  try {
    const data = await api.get<{ contentJson?: string }>(`/page-content/key/${key}`);
    return data?.contentJson ?? null;
  } catch {
    return null;
  }
}

const Index = () => {
  const [hero, setHero] = useState<{ title?: string; subtitle?: string } | null>(null);
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPageContent("home_hero").then((json) => {
        try {
          return json ? (JSON.parse(json) as { title?: string; subtitle?: string }) : null;
        } catch {
          return null;
        }
      }),
      api.get<Video[]>("/videos").catch(() => []),
      api.get<BlogPost[]>("/blog").catch(() => []),
      api.get<Testimonial[]>("/testimonials").catch(() => []),
    ]).then(([h, videos, blog, test]) => {
      setHero(h ?? null);
      setFeaturedVideos(Array.isArray(videos) ? videos.filter((v) => !v.is_paid).slice(0, 6) : []);
      setBlogPosts(Array.isArray(blog) ? blog.slice(0, 3) : []);
      setTestimonials(Array.isArray(test) ? test : []);
    }).finally(() => setLoading(false));
  }, []);

  const heroTitle = hero?.title || "Amplify Your Life Through Yoga";
  const heroSubtitle = hero?.subtitle || "Expert-led classes for every level. Flow, stretch, meditate — anytime, anywhere.";

  const fallbackBlogPosts: BlogPost[] = [
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

  const fallbackTestimonials: Testimonial[] = [
    {
      id: "t1",
      text: "Ampli5 made it so easy to practice again. Ten minutes in the morning is now my favorite ritual.",
      author: "Rohit A.",
    },
    {
      id: "t2",
      text: "I love that I can choose exactly what I need—slow and grounding, or strong and sweaty.",
      author: "Meera S.",
    },
    {
      id: "t3",
      text: "The teachers feel genuinely present and encouraging, even through the screen.",
      author: "Daniel K.",
    },
  ];

  const books: Book[] = [
    {
      title: "Light on Yoga",
      author: "B.K.S. Iyengar",
      description: "A classic reference with detailed posture breakdowns and sequencing guidance for serious students.",
      url: "https://www.amazon.in/dp/0008100468",
    },
    {
      title: "The Heart of Yoga",
      author: "T.K.V. Desikachar",
      description: "A practical, compassionate introduction to adapting yoga to your own body and life.",
      url: "https://www.amazon.in/dp/089281764X",
    },
    {
      title: "Yoga for Everyone",
      author: "Dianne Bondy",
      description: "Inclusive, body-positive practices with clear variations so every practitioner feels welcome.",
      url: "https://www.amazon.in/dp/1465480773",
    },
    {
      title: "The Miracle of Mindfulness",
      author: "Thich Nhat Hanh",
      description: "Short, beautiful teachings on bringing gentle awareness into everyday moments.",
      url: "https://www.amazon.in/dp/1846041066",
    },
  ];

  const effectiveBlogPosts = (blogPosts && blogPosts.length > 0 ? blogPosts : fallbackBlogPosts).slice(0, 3);
  const effectiveTestimonials = (testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials).slice(0, 3);

  if (loading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/20 to-transparent" />
        </div>
        <div className="container relative text-center">
          <motion.h1
            className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {heroSubtitle}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button size="lg" variant="secondary" asChild>
              <Link to="/pricing">Start Your Journey <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/free-videos">Browse Classes</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold md:text-4xl">Featured Free Classes</h2>
            <p className="mt-3 text-muted-foreground">Start your practice today — no membership required</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVideos.map((video, i) => (
              <motion.div
                key={video.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="group overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnailUrl || ""}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                      <Play className="h-12 w-12 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {video.difficulty && (
                      <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">{video.difficulty}</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{[video.instructor, video.duration].filter(Boolean).join(" · ") || "—"}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">
                      <Link to={`/free-videos/${video.id}`} className="hover:text-primary">{video.title}</Link>
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to="/free-videos">View All Videos <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted py-20">
        <div className="container">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold md:text-4xl">Why Ampli5?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Play, title: "200+ Classes", desc: "From gentle yin to power yoga — there's a class for every mood and level." },
              { icon: Users, title: "Expert Instructors", desc: "Learn from certified, passionate teachers with years of experience." },
              { icon: Star, title: "Practice Anywhere", desc: "Stream on any device. Your yoga studio goes wherever you go." },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold md:text-4xl">What Our Members Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {effectiveTestimonials.map((t, i) => (
              <motion.div key={t.id || i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full border-0 shadow-sm">
                  <CardContent className="flex h-full flex-col p-6">
                    <p className="flex-1 text-foreground/80 italic">"{t.text}"</p>
                    <div className="mt-4 border-t pt-4">
                      <p className="font-semibold">{t.author || "—"}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Highlights */}
      <section className="bg-muted py-20">
        <div className="container">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold md:text-4xl">From the Blog</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {effectiveBlogPosts.map((post, i) => (
              <motion.div key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="group overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{post.publishedAt || post.tag || ""}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">
                      <Link to={`/blog/${post.slug || post.id}`} className="hover:text-primary">{post.title}</Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt || ""}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to="/blog">Read More <BookOpen className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recommended Reads */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold md:text-4xl">Books We Love</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            A short, curated list of books to deepen your understanding of yoga, movement, and mindfulness beyond the mat.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book, i) => (
              <motion.div
                key={book.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="h-full border-0 shadow-sm">
                  <CardContent className="flex h-full flex-col p-5">
                    <h3 className="font-serif text-lg font-semibold">{book.title}</h3>
                    <p className="mt-1 text-sm text-primary font-medium">{book.author}</p>
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">{book.description}</p>
                    {book.url && (
                      <Button asChild variant="outline" size="sm" className="mt-4">
                        <a href={book.url} target="_blank" rel="noopener noreferrer">
                          Learn more
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Ready to Transform Your Practice?</h2>
          <p className="mx-auto mt-4 max-w-md opacity-90">Join thousands of yogis. Plans start at just $10/month.</p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link to="/pricing">View Plans <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Index;
