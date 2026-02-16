import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.post<{ message?: string }>("/contact", { name: name.trim(), email: email.trim(), message: message.trim() });
      toast.success(data?.message || "Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Failed to send. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl opacity-90">We'd love to hear from you. Drop us a message and we'll get back to you soon.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-80">We typically respond within 24 hours on business days.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-bold">Get in Touch</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
                <Textarea id="message" placeholder="How can we help?" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Sending..." : "Send Message"}</Button>
            </form>
          </div>

        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold">Contact Information</h2>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">hello@ampli5.life</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">Available worldwide — we're a digital studio.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <Phone className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Support Hours</p>
                <p className="text-sm text-muted-foreground">Mon–Fri, 9am–5pm EST</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    </>
  );
};

export default Contact;
