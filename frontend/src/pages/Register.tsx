import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    const fullName = (name || "").trim() || "User";
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
        toast.error("This email is already registered. Please log in instead.");
        navigate(`/login?next=${encodeURIComponent("/")}`);
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Account created! Please check your email for a confirmation link before logging in.");
    navigate("/login");
  };

  return (
    <>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Sign Up</h1>
          <p className="mx-auto mt-4 max-w-xl opacity-90">Create an account to get started with your yoga journey.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container flex justify-center">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Create your account</CardTitle>
              <p className="text-sm text-muted-foreground">Join Ampli5.Life and start practicing today.</p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="register-name" className="mb-1 block text-sm font-medium">Name</label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="register-email" className="mb-1 block text-sm font-medium">Email</label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="register-phone" className="mb-1 block text-sm font-medium">Phone (optional)</label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="register-password" className="mb-1 block text-sm font-medium">Password</label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={submitting}>Sign Up</Button>
                <GoogleSignInButton redirectTo={window.location.href} />
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Register;
