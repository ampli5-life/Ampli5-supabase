import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => (
  <footer className="bg-[#0B1E14] text-white pt-20 pb-10">
    <div className="container max-w-7xl mx-auto px-4">
      <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5 mb-16">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="font-serif text-3xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
              Ampli5
            </span>
            <span className="text-secondary text-3xl leading-none -ml-1">.</span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Empowering you to live a healthier, more mindful life through accessible yoga and wellness practices.
          </p>
        </div>

        <div>
          <h4 className="mb-6 font-sans text-sm font-semibold text-white">Platform</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/free-videos" className="text-white/60 hover:text-secondary transition-colors">Browse Classes</Link></li>
            <li><Link to="#" className="text-white/60 hover:text-secondary transition-colors">Live Schedule</Link></li>
            <li><Link to="#" className="text-white/60 hover:text-secondary transition-colors">Instructors</Link></li>
            <li><Link to="/pricing" className="text-white/60 hover:text-secondary transition-colors">Pricing</Link></li>
            <li><Link to="#" className="text-white/60 hover:text-secondary transition-colors">Gift Cards</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-sans text-sm font-semibold text-white">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/about" className="text-white/60 hover:text-secondary transition-colors">About Us</Link></li>
            <li><Link to="#" className="text-white/60 hover:text-secondary transition-colors">Careers</Link></li>
            <li><Link to="/blog" className="text-white/60 hover:text-secondary transition-colors">Blog</Link></li>
            <li><Link to="#" className="text-white/60 hover:text-secondary transition-colors">Press</Link></li>
            <li><Link to="/contact" className="text-white/60 hover:text-secondary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-1">
          <h4 className="mb-6 font-sans text-sm font-semibold text-white">Newsletter</h4>
          <p className="text-white/60 text-sm mb-4 leading-relaxed">
            Subscribe for weekly wellness tips and updates.
          </p>
          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Email address"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-secondary/50 focus:ring-secondary/50 rounded-lg h-12"
            />
            <Button className="w-full bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-lg h-12 transition-transform active:scale-95">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 text-sm text-white/40">
        <p>© {new Date().getFullYear()} Ampli5. All rights reserved.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Accessibility</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
