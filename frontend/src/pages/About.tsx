import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const About = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [story, setStory] = useState<string | null>(null);
  const [mission, setMission] = useState<string | null>(null);

  useEffect(() => {
    api.get<TeamMember[]>("/team").then((d) => setTeam(Array.isArray(d) ? d : [])).catch(() => []);
    api.get<{ contentJson?: string }>("/page-content/key/about_story").then((d) => {
      try {
        if (d?.contentJson) setStory(d.contentJson);
      } catch {}
    }).catch(() => {});
    api.get<{ contentJson?: string }>("/page-content/key/about_mission").then((d) => {
      try {
        if (d?.contentJson) setMission(d.contentJson);
      } catch {}
    }).catch(() => {});
  }, []);

  const storyText = story || "Ampli5 was born from a simple belief: yoga should be accessible to everyone, everywhere. We bring world-class instruction to your living room.";
  const missionText = mission || "We believe that yoga is more than exercise — it's a pathway to a more balanced, joyful life. Ampli5.Life was created to make high-quality yoga instruction accessible regardless of location, schedule, or budget. Our carefully curated library features classes for every level, from absolute beginners to advanced practitioners.";

  return (
  <>
    {/* Hero */}
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container text-center">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Our Story</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
          {storyText}
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="py-20">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl font-bold">Our Mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {missionText}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=400&fit=crop"
            alt="Yoga practice"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-muted py-20">
      <div className="container">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold">What We Believe</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              label: "Accessibility",
              description: "Yoga should meet you where you are—regardless of age, ability, schedule, or equipment.",
            },
            {
              label: "Quality over quantity",
              description: "Every class is carefully curated so you always feel guided, safe, and supported.",
            },
            {
              label: "Sustainable practice",
              description: "We focus on small, consistent steps that fit into real life—and last for years.",
            },
          ].map((value, i) => (
            <motion.div
              key={value.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Card className="border-0 shadow-sm h-full">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3 uppercase tracking-wide text-xs">
                    {value.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="bg-muted py-20">
      <div className="container">
        <h2 className="mb-12 text-center font-serif text-3xl font-bold">Meet Our Team</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {team.map((member, i) => (
            <motion.div key={member.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="overflow-hidden border-0 shadow-sm">
                <div className="aspect-square overflow-hidden">
                  <img src={member.avatar_url || "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop"} alt={member.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-serif text-xl font-semibold">{member.name}</h3>
                  {member.role && <p className="text-sm text-primary">{member.role}</p>}
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio || ""}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
  );
};

export default About;
