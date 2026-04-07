import { createContext } from "react";

export type AuthUser = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
};

export type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);
