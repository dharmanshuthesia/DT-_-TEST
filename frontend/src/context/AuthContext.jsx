import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getToken,
  setToken,
  decodeToken,
  tokenIsExpired,
  setUnauthorizedHandler,
} from "../api/client.js";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setTokenState] = useState(() => {
    const t = getToken();
    return t && !tokenIsExpired(t) ? t : null;
  });

  const applyToken = useCallback((t) => {
    setToken(t);
    setTokenState(t || null);
  }, []);

  const logout = useCallback(() => {
    applyToken(null);
    navigate("/login");
  }, [applyToken, navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      applyToken(null);
      navigate("/login");
    });
  }, [applyToken, navigate]);

  useEffect(() => {
    if (!token) return;
    const claims = decodeToken(token);
    if (!claims || !claims.exp) return;
    const ms = claims.exp * 1000 - Date.now();
    if (ms <= 0) {
      logout();
      return;
    }
    const id = setTimeout(logout, ms);
    return () => clearTimeout(id);
  }, [token, logout]);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });
      const jwt = res.JWT || res.jwt || res.token;
      if (!jwt) throw new Error("No token returned by server");
      applyToken(jwt);
      return jwt;
    },
    [applyToken]
  );

  const register = useCallback(async (payload) => {
    return authApi.register(payload);
  }, []);

  const resetPassword = useCallback(async (payload) => {
    return authApi.resetPassword(payload);
  }, []);

  const value = useMemo(() => {
    const claims = token ? decodeToken(token) : null;
    return {
      token,
      isAuthenticated: Boolean(token),
      email: claims?.sub || null,
      login,
      register,
      resetPassword,
      logout,
    };
  }, [token, login, register, resetPassword, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
