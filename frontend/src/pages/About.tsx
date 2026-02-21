import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Sparkles, Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  avatar_url?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const About = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [story, setStory] = useState<string | null>(null);
  const [mission, setMission] = useState<string | null>(null);

  useEffect(() => {
    api.get<TeamMember[]>("/team").then((d) => setTeam(Array.isArray(d) ? d : [])).catch(() => []);
    api.get<{ contentJson?: string }>("/page-content/key/about_story").then((d) => {
      try { if (d?.contentJson) setStory(d.contentJson); } catch { }
    }).catch(() => { });
    api.get<{ contentJson?: string }>("/page-content/key/about_mission").then((d) => {
      try { if (d?.contentJson) setMission(d.contentJson); } catch { }
    }).catch(() => { });
  }, []);

  const storyText = story || "Ampli5 was born from a simple belief: yoga should be accessible to everyone, everywhere. We bring world-class instruction to your living room.";
  const missionText = mission || "We believe that yoga is more than exercise — it's a pathway to a more balanced, joyful life. Ampli5.Life was created to make high-quality yoga instruction accessible regardless of location, schedule, or budget. Our carefully curated library features classes for every level, from absolute beginners to advanced practitioners.";

  const values = [
    {
      icon: Heart,
      label: "Accessibility",
      description: "Yoga should meet you where you are — regardless of age, ability, schedule, or equipment.",
      color: "from-rose-500/20 to-rose-500/5",
      iconColor: "text-rose-500",
    },
    {
      icon: Target,
      label: "Quality Over Quantity",
      description: "Every class is carefully curated so you always feel guided, safe, and supported.",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      icon: Sparkles,
      label: "Sustainable Practice",
      description: "We focus on small, consistent steps that fit into real life — and last for years.",
      color: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-500",
    },
  ];

  const stats = [
    { value: "200+", label: "Video Classes" },
    { value: "15+", label: "Expert Instructors" },
    { value: "10K+", label: "Happy Members" },
    { value: "4.9", label: "App Rating" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-card" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(71,95%,60%)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/3 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[hsl(71,95%,60%)] text-xs font-bold tracking-[0.3em] uppercase mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" /> OUR STORY
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground dark:text-foreground mb-6 leading-tight"
          >
            Amplifying Lives
            <br />
            <span className="text-[hsl(71,95%,60%)] italic">Through Yoga</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-primary-foreground/70 dark:text-foreground/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {storyText}
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-8 z-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card rounded-2xl border border-border/50 shadow-xl p-6 md:p-8"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(71,95%,60%)] dark:text-primary mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid items-center gap-16 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
              OUR MISSION
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Making Yoga
              <br />
              <span className="text-muted-foreground">Accessible to All</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              {missionText}
            </p>
            <Link to="/free-videos">
              <Button className="rounded-full bg-[hsl(71,95%,60%)] text-[hsl(155,40%,12%)] hover:bg-[hsl(71,95%,55%)] px-8 h-12 font-bold transition-all duration-300 hover:scale-105 active:scale-95">
                Explore Classes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop"
                alt="Yoga practice"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-2xl border border-border/50 shadow-lg p-5 max-w-[200px]"
            >
              <p className="text-3xl font-bold text-[hsl(71,95%,60%)] dark:text-primary mb-1">5+ yrs</p>
              <p className="text-xs text-muted-foreground">Helping people find balance through yoga</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/50 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
              OUR VALUES
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              What We Believe
            </motion.h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, i) => (
              <motion.div
                key={value.label}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="h-full border rounded-3xl card-hover bg-card overflow-hidden group">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className={`h-6 w-6 ${value.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.label}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} custom={0} className="text-[hsl(71,95%,60%)] dark:text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                OUR PEOPLE
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
                Meet Our Team
              </motion.h2>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {team.map((member, i) => (
                <motion.div key={member.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="overflow-hidden rounded-3xl border card-hover bg-card group">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.avatar_url || `https://i.pravatar.cc/400?u=${member.name}`}
                        alt={member.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      {member.role && (
                        <p className="text-sm font-semibold text-primary mt-1">{member.role}</p>
                      )}
                      {member.bio && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-card" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[hsl(71,95%,60%)]/5 blur-[200px]" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-primary-foreground dark:text-foreground">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
          >
            Join Our Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="opacity-70 text-lg mb-10 max-w-lg mx-auto"
          >
            Start your free trial today and discover why thousands choose Ampli5 for their daily practice.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <Link to="/pricing">
              <Button size="lg" className="rounded-full bg-[hsl(71,95%,60%)] text-[hsl(155,40%,12%)] hover:bg-[hsl(71,95%,55%)] px-10 h-14 text-base font-bold shadow-[0_0_40px_rgba(183,237,70,0.25)] transition-all duration-300 hover:scale-105 active:scale-95">
                Start Free Trial
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
