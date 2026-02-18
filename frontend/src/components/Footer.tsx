import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-primary text-primary-foreground">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="Ampli5" className="h-9 object-contain" />
            <span className="text-sm font-medium opacity-90">.Life</span>
          </Link>
          <p className="mt-3 text-sm opacity-80">
            Amplify your life through the transformative power of yoga. Practice anytime, anywhere.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider opacity-80">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/free-videos" className="opacity-80 hover:opacity-100">Videos</Link></li>
            <li><Link to="/blog" className="opacity-80 hover:opacity-100">Blog</Link></li>
            <li><Link to="/books" className="opacity-80 hover:opacity-100">Books</Link></li>
            <li><Link to="/pricing" className="opacity-80 hover:opacity-100">Pricing</Link></li>
            <li><Link to="/about" className="opacity-80 hover:opacity-100">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider opacity-80">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="opacity-80 hover:opacity-100">Contact</Link></li>
            <li><Link to="/terms" className="opacity-80 hover:opacity-100">Terms of Service</Link></li>
            <li><Link to="/privacy" className="opacity-80 hover:opacity-100">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="opacity-80 hover:opacity-100">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider opacity-80">Connect</h4>
          <p className="text-sm opacity-80">hello@ampli5.life</p>
          <div className="mt-3 flex gap-3">
            <a href="#" className="opacity-80 hover:opacity-100" aria-label="Instagram">📷</a>
            <a href="#" className="opacity-80 hover:opacity-100" aria-label="YouTube">▶️</a>
            <a href="#" className="opacity-80 hover:opacity-100" aria-label="Facebook">📘</a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-sm opacity-60">
        <p>© {new Date().getFullYear()} Ampli5.Life — Made with <Heart className="inline h-3 w-3" /> for yogis everywhere</p>
      </div>
    </div>
  </footer>
);

export default Footer;
