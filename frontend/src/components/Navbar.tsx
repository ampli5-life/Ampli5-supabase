import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const baseNavLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Videos", to: "/free-videos" },
  { label: "News", to: "/news" },
  { label: "Blog", to: "/blog" },
  { label: "Pricing", to: "/pricing" },
];

function getInitials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const navLinks = [...baseNavLinks, ...(profile?.is_admin ? [{ label: "Admin", to: "/admin" }] : [])];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    signOut();
    setMobileOpen(false);
    navigate("/");
  };

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isTransparent
          ? "bg-transparent py-4 border-transparent"
          : "bg-background/90 backdrop-blur-md py-3 shadow-sm border-b"
        }`}
    >
      <nav className="container max-w-7xl mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className={`font-serif text-2xl font-bold tracking-tight transition-colors ${isTransparent ? 'text-white' : 'text-primary'}`}>
            Ampli5
          </span>
          <span className="text-secondary text-2xl leading-none -ml-1">.</span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to} className="relative group">
                <Link
                  to={link.to}
                  className={`text-sm font-semibold tracking-wide transition-colors uppercase ${isTransparent ? 'text-white/80 hover:text-secondary' : 'text-foreground/70 hover:text-primary'
                    } ${isActive ? (isTransparent ? '!text-secondary' : '!text-primary') : ''}`}
                >
                  {link.label}
                </Link>
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute -bottom-2 left-0 right-0 h-0.5 rounded-full ${isTransparent ? 'bg-secondary' : 'bg-primary'}`}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && (
            profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none ring-offset-2 focus:ring-2 focus:ring-secondary transition-transform hover:scale-105">
                    <Avatar className={`h-10 w-10 border-2 ${isTransparent ? 'border-white/20' : 'border-primary/20'}`}>
                      <AvatarFallback className="bg-primary text-white font-semibold shadow-inner">
                        {getInitials(profile.full_name, profile.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl mt-2 p-2">
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 font-medium transition-colors hover:bg-muted focus:bg-muted mb-1">
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-2.5 font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className={`font-semibold rounded-full px-6 transition-all ${isTransparent ? 'text-white hover:bg-white/10 hover:text-white' : 'text-foreground hover:bg-primary/5'}`}>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild className="rounded-full font-bold px-6 bg-secondary text-primary hover:bg-secondary/90 shadow-sm transition-transform hover:scale-105">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden rounded-full p-2 transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-primary hover:bg-primary/5'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t mt-4 overflow-hidden rounded-b-3xl shadow-xl"
          >
            <ul className="container flex flex-col gap-2 py-6 px-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <div className="h-px bg-border/50 my-2 mx-4" />
              <li className="mt-2 flex flex-col gap-3 px-4">
                {profile ? (
                  <>
                    <Button variant="outline" asChild className="w-full rounded-full py-6 font-bold">
                      <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
                    </Button>
                    <Button variant="ghost" className="w-full rounded-full py-6 font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={handleLogout}>Log out</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full rounded-full py-6 font-bold border-primary text-primary">
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild className="w-full rounded-full py-6 font-bold bg-secondary text-primary hover:bg-secondary/90">
                      <Link to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
