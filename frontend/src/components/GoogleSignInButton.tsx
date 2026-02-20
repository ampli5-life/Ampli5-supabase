import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function GoogleSignInButton({ onSuccess, redirectTo }: GoogleSignInButtonProps = {}) {
  const { signInWithGoogleOAuthRedirect } = useAuth();

  const handleClick = () => {
    void signInWithGoogleOAuthRedirect(redirectTo);
    onSuccess?.();
  };

  return (
    <div className="flex justify-center">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
      >
        Continue with Google
      </Button>
    </div>
  );
}
