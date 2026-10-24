import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../auth/AuthContext";
import { login } from "../../auth/authService";

export function useLogin() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Preencha seu e-mail e sua senha.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await login(email.trim(), password);

      signIn(result.user, result.access_token, result.refresh_token);
      router.replace("/(tabs)/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível entrar."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegister() {
    router.push("/register");
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    remember,
    setRemember,
    loading,
    error,
    handleLogin,
    handleRegister,
  };
}
