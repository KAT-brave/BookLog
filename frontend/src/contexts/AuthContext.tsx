import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signup: (username: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const signup = async (
    username: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    const res = await axios.post(`${API_BASE}/api/v1/auth/signup`, {
      user: { username, email, password, password_confirmation: passwordConfirmation },
    });
    const jwt = res.headers["authorization"];
    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser(res.data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE}/api/v1/auth/login`, {
      user: { email, password },
    });
    const jwt = res.headers["authorization"];
    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.delete(`${API_BASE}/api/v1/auth/logout`, {
      headers: { Authorization: token ?? "" },
    });
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
