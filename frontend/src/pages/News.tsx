import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Calendar } from "lucide-react";

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
      <div className="container flex min-h-[40vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <section className="container">
        <h1 className="font-serif text-3xl font-bold md:text-4xl mb-2">News</h1>
        <p className="text-muted-foreground mb-10">Events and scheduled classes.</p>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold mb-4">
              <CalendarDays className="h-5 w-5" />
              Events
            </h2>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
            ) : (
              <div className="space-y-4">
                {events.map((e) => (
                  <Card key={e.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                      <h3 className="font-semibold mt-1">{e.title}</h3>
                      {e.instructor && <p className="text-sm text-muted-foreground">Instructor: {e.instructor}</p>}
                      {e.description && <p className="mt-2 text-sm text-foreground/80">{e.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold mb-4">
              <Calendar className="h-5 w-5" />
              Scheduled Classes
            </h2>
            {schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled classes yet.</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((s) => (
                  <Card key={s.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-medium">{s.day_of_week ?? ""} {s.time ?? ""}</span>
                      <span className="text-foreground/80">{s.class_name ?? ""}</span>
                      {s.instructor && <span className="text-sm text-muted-foreground">{s.instructor}</span>}
                      {s.level && <span className="text-xs rounded bg-muted px-2 py-0.5">{s.level}</span>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
