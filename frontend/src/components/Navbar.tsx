import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const navLinks = [...baseNavLinks, ...(profile?.is_admin ? [{ label: "Admin", to: "/admin" }] : [])];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    signOut();
    setMobileOpen(false);
    navigate("/");
  };

  const isTransparent = isHome && !scrolled;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isTransparent
        ? "bg-transparent py-5"
        : "bg-background/80 backdrop-blur-xl py-3 shadow-[0_1px_0_0_hsl(var(--border)/0.5)]"
        }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative">
          <img src="/logo.png" alt="Ampli5" className={`h-9 object-contain transition-all group-hover:scale-105 duration-300 ${isTransparent ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'}`} />
          <span className={`font-serif text-xl font-bold tracking-tight transition-colors duration-300 hidden sm:inline ${isTransparent ? 'text-white' : 'text-foreground'}`}>
            .Life
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to} className="relative">
                <Link
                  to={link.to}
                  className={`relative px-4 py-2 text-[13px] font-semibold tracking-wide uppercase rounded-full transition-all duration-300
                    ${isTransparent
                      ? `text-white/75 hover:text-white ${isActive ? '!text-white' : ''}`
                      : `text-foreground/60 hover:text-foreground ${isActive ? '!text-foreground' : ''}`
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-full -z-10 ${isTransparent ? 'bg-white/10' : 'bg-primary/8'
                        }`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`relative p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95
              ${isTransparent
                ? 'text-white/80 hover:bg-white/10'
                : 'text-foreground/60 hover:bg-muted hover:text-foreground'
              }`}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "light" ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="h-[18px] w-[18px]" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="h-[18px] w-[18px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {!loading && (
            profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(221,83%,53%)] ring-offset-2 ring-offset-background transition-transform hover:scale-105 active:scale-95">
                    <Avatar className={`h-10 w-10 border-2 transition-colors ${isTransparent ? 'border-white/20' : 'border-border'}`}>
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                        {getInitials(profile.full_name, profile.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-2xl border p-2 mt-2 bg-popover/95 backdrop-blur-xl">
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 font-medium hover:bg-muted focus:bg-muted mb-1">
                    <Link to="/profile" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-3 px-4 font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 focus:bg-rose-500/10 focus:text-rose-600">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mr-3">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className={`font-semibold rounded-full px-5 text-[13px] transition-all duration-300 ${isTransparent ? 'text-white hover:bg-white/10 hover:text-white' : 'text-foreground/70 hover:bg-muted hover:text-foreground'}`}>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild className="rounded-full font-bold px-6 text-[13px] bg-[hsl(221,83%,53%)] text-[hsl(222,47%,12%)] hover:bg-[hsl(221,83%,48%)] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'}`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            className={`p-2 rounded-full transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden absolute top-full left-3 right-3 mt-2 bg-popover/95 backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden mx-auto max-w-md"
          >
            <ul className="flex flex-col p-4 gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    className={`block rounded-2xl px-4 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors
                      ${location.pathname === link.to
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                      }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="h-px bg-border mx-4" />
            <div className="p-4 flex flex-col gap-2">
              {profile ? (
                <>
                  <Button variant="outline" asChild className="w-full rounded-full h-12 font-bold">
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
                  </Button>
                  <Button variant="ghost" className="w-full rounded-full h-12 font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={handleLogout}>Log out</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full rounded-full h-12 font-bold">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
                  </Button>
                  <Button asChild className="w-full rounded-full h-12 font-bold bg-[hsl(221,83%,53%)] text-[hsl(222,47%,12%)] hover:bg-[hsl(221,83%,48%)]">
                    <Link to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
