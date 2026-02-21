import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary dark:bg-card border-t border-border/10 pt-20 pb-10 text-primary-foreground dark:text-foreground">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5 mb-16">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logo.png" alt="Ampli5" className="h-10 object-contain brightness-0 invert transition-transform group-hover:scale-105 duration-300" />
            <span className="font-serif text-xl font-bold tracking-tight">
              .Life
            </span>
          </Link>
          <p className="text-current/60 text-sm leading-relaxed max-w-sm">
            Empowering you to live a healthier, more mindful life through accessible yoga and wellness practices.
          </p>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold">Platform</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/free-videos" className="text-current/50 hover:text-[hsl(71,95%,60%)] transition-colors duration-300">Browse Classes</Link></li>
            <li><Link to="/news" className="text-current/50 hover:text-[hsl(71,95%,60%)] transition-colors duration-300">News & Events</Link></li>
            <li><Link to="/pricing" className="text-current/50 hover:text-[hsl(71,95%,60%)] transition-colors duration-300">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/about" className="text-current/50 hover:text-[hsl(71,95%,60%)] transition-colors duration-300">About Us</Link></li>
            <li><Link to="/blog" className="text-current/50 hover:text-[hsl(71,95%,60%)] transition-colors duration-300">Blog</Link></li>
            <li><Link to="/contact" className="text-current/50 hover:text-[hsl(71,95%,60%)] transition-colors duration-300">Contact</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-1">
          <h4 className="mb-6 text-sm font-bold">Newsletter</h4>
          <p className="text-current/50 text-sm mb-4 leading-relaxed">
            Subscribe for weekly wellness tips and updates.
          </p>
          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Email address"
              className="bg-white/5 border-white/10 text-current placeholder:text-current/30 focus:border-[hsl(71,95%,60%)]/50 focus:ring-[hsl(71,95%,60%)]/50 rounded-full h-12 px-5"
            />
            <Button className="w-full bg-[hsl(71,95%,60%)] text-[hsl(155,40%,12%)] hover:bg-[hsl(71,95%,55%)] font-bold rounded-full h-12 transition-all duration-300 active:scale-95 hover:shadow-md">
              Subscribe <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between border-t border-current/10 pt-8 text-sm text-current/35">
        <p>© {new Date().getFullYear()} Ampli5. All rights reserved.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <Link to="/terms" className="hover:text-current transition-colors duration-300">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-current transition-colors duration-300">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:text-current transition-colors duration-300">Refund Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
