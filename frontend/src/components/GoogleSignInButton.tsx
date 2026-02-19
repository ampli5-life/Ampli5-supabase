import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps = {}) {
  const { signInWithGoogleOAuthRedirect } = useAuth();

  const handleClick = () => {
    void signInWithGoogleOAuthRedirect();
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
