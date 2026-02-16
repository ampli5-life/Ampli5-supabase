import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, User, CreditCard, Calendar } from "lucide-react";

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

const Profile = () => {
  const { profile, subscriptionInfo, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !profile) {
      navigate("/login");
    }
  }, [loading, profile, navigate]);

  if (loading || !profile) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">My Profile</h1>
          <p className="mx-auto mt-4 max-w-xl opacity-90">Your account and subscription details.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-2xl space-y-8">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <User className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-foreground">{profile.full_name || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-foreground">{profile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionInfo?.startDate || subscriptionInfo?.endDate ? (
                <>
                  <div className="flex items-start gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Plan</p>
                      <p className="text-foreground capitalize">
                        {subscriptionInfo.planDisplayName || subscriptionInfo.plan || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Period</p>
                      <p className="text-foreground">
                        {formatDate(subscriptionInfo.startDate)} – {formatDate(subscriptionInfo.endDate)}
                      </p>
                    </div>
                  </div>
                  {isSubscribed ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Active; you have access to premium content until {formatDate(subscriptionInfo.endDate)}.
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Subscription ended. Subscribe again from Pricing to access premium content.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No subscription yet. Subscribe to Silver or Gold from Pricing to access premium videos.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Profile;
