import React, { createContext, useContext, useState, useEffect } from "react";
import type { GetUser } from "@/types/user";

export interface AuthContextType {
  user: GetUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { phone: string; passwordHash: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<GetUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "https://tajer-backend.tajerplatform.workers.dev/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error("Not authenticated");

        const data: GetUser = await response.json();
        
        if (data.role !== "ADMIN") {
          throw new Error("ليس لديك صلاحية الدخول. يلزم أن تكون مسؤولاً.");
        }
        
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        
        if (error instanceof Error && error.message.includes("صلاحية")) {
          console.error(error.message);
        }
      } finally {
        setIsLoading(false);
      };
    };
    fetchUser();
  }, []);
  const login = async (credentials: { phone: string; passwordHash: string }) => {
    try {
      const response = await fetch(
        "https://tajer-backend.tajerplatform.workers.dev/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(credentials),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      
      if (data.user && data.user.role !== "ADMIN") {
        throw new Error("ليس لديك صلاحية الدخول. يلزم أن تكون مسؤولاً.");
      }
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(
        "https://tajer-backend.tajerplatform.workers.dev/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};