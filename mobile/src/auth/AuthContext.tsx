import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type AuthContextData = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  signIn: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextData | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    null,
  );

  function signIn(
    nextUser: AuthUser,
    nextAccessToken: string,
    nextRefreshToken: string,
  ) {
    setUser(nextUser);
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
  }

  function signOut() {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken && user),
      signIn,
      signOut,
    }),
    [user, accessToken, refreshToken],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}