"use client";

import type { ReactNode } from "react";
import PixelButton, {
  type PixelButtonSize,
  type PixelButtonVariant,
} from "@/components/landing/PixelButton";
import { useAuth, type AuthMode } from "./AuthProvider";

/**
 * A call to action that opens the auth modal instead of navigating. Lets Server
 * Components (the final CTA, for example) keep their existing markup and only
 * swap the button.
 */
export default function AuthTriggerButton({
  mode = "signup",
  children,
  variant,
  size,
  className,
}: {
  mode?: AuthMode;
  children: ReactNode;
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
  className?: string;
}) {
  const { openAuth, user, isSessionPending } = useAuth();

  return (
    <PixelButton
      variant={variant}
      size={size}
      className={className}
      disabled={isSessionPending}
      onClick={() => openAuth(user ? "signin" : mode)}
    >
      {children}
    </PixelButton>
  );
}
