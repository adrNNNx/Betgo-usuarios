// components/auth/AuthFlow.tsx
"use client";

import { useState } from "react";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";

type AuthMode = "login" | "register";

interface AuthFlowProps {
  onSuccess?: () => void;
  onBack?: () => void;
  initialMode?: AuthMode;
}

export function AuthFlow({
  onSuccess,
  onBack,
  initialMode = "login",
}: AuthFlowProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  if (mode === "login") {
    return (
      <LoginScreen
        onSuccess={onSuccess}
        onSwitchToRegister={() => setMode("register")}
        onBack={onBack}
      />
    );
  }

  return (
    <RegisterScreen
      onSuccess={onSuccess}
      onSwitchToLogin={() => setMode("login")}
      onBack={onBack}
    />
  );
}
