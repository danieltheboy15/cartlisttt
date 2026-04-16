import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  businessName?: string;
  ownerName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePicture?: string;
  whatsappNumber?: string;
  businessCategory?: string;
  hasSeenWelcome?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("cartlist_token");
    const headers = {
      ...(options.headers || {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        setUser(null);
        localStorage.removeItem("cartlist_token");
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetchWithAuth("/api/auth/me");
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    if (token) {
      localStorage.setItem("cartlist_token", token);
    }
  };

  const logout = async () => {
    try {
      await fetchWithAuth("/api/auth/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("cartlist_token");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
