import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const noop = () => {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme?: "outline" | "filled_blue" | "filled_black"; size?: "large" | "medium" | "small"; type?: "standard" | "icon"; text?: "signin_with" | "signup_with" | "continue_with" }
          ) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps = {}) {
  const divRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess ?? noop);
  onSuccessRef.current = onSuccess ?? noop;
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !divRef.current) return;

    const tryRender = () => {
      if (!window.google?.accounts?.id) {
        requestAnimationFrame(tryRender);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          signInWithGoogle(response.credential).then((result) => {
            if (result.error) toast.error(result.error.message);
            else onSuccessRef.current();
          });
        },
      });
      if (divRef.current) {
        window.google.accounts.id.renderButton(divRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "continue_with",
        });
      }
    };
    tryRender();
  }, [signInWithGoogle]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div className="flex justify-center">
        <Button type="button" variant="outline" className="w-full" disabled>
          Sign in with Google (not configured)
        </Button>
      </div>
    );
  }

  return <div ref={divRef} className="flex justify-center" />;
}
