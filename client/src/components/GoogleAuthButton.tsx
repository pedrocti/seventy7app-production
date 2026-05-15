// client/src/components/GoogleAuthButton.tsx
import { useEffect, useRef, useCallback } from "react";

interface Props {
  onCredential: (credential: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

declare global {
  interface Window { google: any; }
}

export default function GoogleAuthButton({ onCredential, text = "continue_with" }: Props) {
  const divRef      = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);

  // Keep callback ref current without re-running effect
  useEffect(() => { callbackRef.current = onCredential; }, [onCredential]);

  const init = useCallback(() => {
    if (!window.google?.accounts?.id || !divRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback:  (res: { credential: string }) => callbackRef.current(res.credential),
    });

    window.google.accounts.id.renderButton(divRef.current, {
      theme:  "filled_black",
      size:   "large",
      width:  360,
      text,
      shape:  "rectangular",
    });
  }, [text]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("[Google] VITE_GOOGLE_CLIENT_ID not set");
      return;
    }

    // Script already loaded
    if (window.google?.accounts?.id) {
      init();
      return;
    }

    // Script already in DOM but not yet loaded
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      existing.addEventListener("load", init);
      return () => existing.removeEventListener("load", init);
    }

    // Inject script fresh
    const script    = document.createElement("script");
    script.id       = "google-gsi-script";
    script.src      = "https://accounts.google.com/gsi/client";
    script.async    = true;
    script.defer    = true;
    script.onload   = init;
    script.onerror  = () => console.error("[Google] Failed to load GSI script");
    document.head.appendChild(script);

    return () => script.removeEventListener("load", init);
  }, [init]);

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", minHeight: 44 }}>
      <div ref={divRef} />
    </div>
  );
}