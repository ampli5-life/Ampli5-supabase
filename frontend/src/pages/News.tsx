import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Calendar, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

interface EventRow {
  id: string;
  title: string;
  date: string;
  description?: string;
  instructor?: string;
}

interface ScheduleRow {
  id: string;
  day_of_week?: string;
  time?: string;
  class_name?: string;
  instructor?: string;
  level?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const News = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<EventRow[]>("/events").catch(() => []),
      api.get<ScheduleRow[]>("/schedules").catch(() => []),
    ]).then(([ev, sc]) => {
      setEvents(Array.isArray(ev) ? ev : []);
      setSchedules(Array.isArray(sc) ? sc : []);
    }).finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch {
      return d;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary dark:bg-card" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(199,89%,48%)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/3 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground dark:text-foreground mb-4"
          >
            News & Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-primary-foreground/70 dark:text-foreground/60 text-lg max-w-xl mx-auto"
          >
            Stay updated with upcoming events and scheduled classes.
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Events */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-10 h-10 rounded-xl bg-[hsl(199,89%,48%)]/15 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-[hsl(199,89%,48%)] dark:text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold">Upcoming Events</h2>
              </motion.div>

              {events.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-dashed border-border/50 p-12 text-center"
                >
                  <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events yet.</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Check back soon for new events!</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {events.map((e, i) => (
                    <motion.div key={e.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                      <Card className="overflow-hidden rounded-2xl border card-hover">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(e.date)}
                          </div>
                          <h3 className="font-serif text-lg font-bold mb-2">{e.title}</h3>
                          {e.instructor && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Users className="h-3.5 w-3.5" />
                              Instructor: {e.instructor}
                            </div>
                          )}
                          {e.description && <p className="text-sm text-foreground/70 leading-relaxed">{e.description}</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheduled Classes */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-10 h-10 rounded-xl bg-[hsl(199,89%,48%)]/15 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[hsl(199,89%,48%)] dark:text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold">Scheduled Classes</h2>
              </motion.div>

              {schedules.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl border border-dashed border-border/50 p-12 text-center"
                >
                  <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No scheduled classes yet.</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">New classes will be posted here.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((s, i) => (
                    <motion.div key={s.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                      <Card className="overflow-hidden rounded-2xl card-hover">
                        <CardContent className="p-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {s.day_of_week ?? ""} {s.time ?? ""}
                          </div>
                          <span className="text-foreground/80 font-medium">{s.class_name ?? ""}</span>
                          {s.instructor && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Users className="h-3 w-3" />{s.instructor}
                            </span>
                          )}
                          {s.level && (
                            <span className="text-[11px] font-bold rounded-full bg-primary/10 text-primary px-3 py-1 uppercase tracking-wider">
                              {s.level}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
