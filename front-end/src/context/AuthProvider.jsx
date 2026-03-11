import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import API from "../services/api";

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkUser = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }

    };

    checkUser();

  }, []);

  const login = async (email, password) => {

    const res = await API.post("/auth/login", { email, password });

    const token = res.data.token;

    localStorage.setItem("token", token);

    const userRes = await API.get("/auth/me");

    setUser(userRes.data);

    return userRes.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};