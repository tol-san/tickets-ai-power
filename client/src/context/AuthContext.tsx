import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type UserResponse = {
  user: AuthUser;
};

type ErrorResponse = {
  message?: string;
};

async function parseError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as ErrorResponse;
    return payload.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/me", {
        credentials: "include",
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error(
          await parseError(response, "Unable to fetch current user."),
        );
      }

      const data = (await response.json()) as UserResponse;
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response, "Unable to sign in."));
      }

      await refreshUser();
    },
    [refreshUser],
  );

  const signOut = useCallback(async () => {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await parseError(response, "Unable to sign out."));
    }

    setUser(null);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };

    void initialize();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      refreshUser,
    }),
    [loading, refreshUser, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
