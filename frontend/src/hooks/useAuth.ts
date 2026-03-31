import { useState, useEffect } from "react";
import { User } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("sass_token");
    const storedUser = localStorage.getItem("sass_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("sass_token", token);
    localStorage.setItem("sass_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("sass_token");
    localStorage.removeItem("sass_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, token, isAuthenticated, isLoading, login, logout };
};
