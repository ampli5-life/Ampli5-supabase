import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const queryParams = new URLSearchParams(location.search);
  const from = (location.state as { from?: string })?.from || queryParams.get("next") || "/";

  // If already logged in, redirect
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back!");
      navigate(from);
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Log In</h1>
          <p className="mx-auto mt-4 max-w-xl opacity-90">Access your account to stream classes and manage your membership.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container flex justify-center">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Sign in to Ampli5.Life</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your credentials below.</p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1 block text-sm font-medium">Email</label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="mb-1 block text-sm font-medium">Password</label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={submitting}>Log In</Button>
                <GoogleSignInButton redirectTo={window.location.href} />
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Login;
