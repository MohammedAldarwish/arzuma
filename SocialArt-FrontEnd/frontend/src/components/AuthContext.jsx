import React, { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated as checkAuth, clearTokens } from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userStr && token && checkAuth()) {
          const userObj = JSON.parse(userStr);
          setUser(userObj);
          setIsAuthenticated(true);
          setIsInstructor(!!userObj.stripe_account_id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsInstructor(!!userData.stripe_account_id);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setIsInstructor(false);
  };

  const value = {
    user,
    isAuthenticated,
    isInstructor,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
