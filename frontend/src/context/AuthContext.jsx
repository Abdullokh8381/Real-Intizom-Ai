import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(null);
const API_BASE = "https://intizom-backend-ibcz.onrender.com/api";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("intizom_user");
      const savedToken = localStorage.getItem("intizom_token");
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      localStorage.removeItem("intizom_user");
      localStorage.removeItem("intizom_token");
    }
    setLoading(false);
  }, []);

  async function googleLogin(credential) {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("intizom_user", JSON.stringify(data.user));
      localStorage.setItem("intizom_token", data.token);
      setUser(data.user);
      setToken(data.token);
      toast.success("Xush kelibsiz!");
    } catch (err) {
      console.error(err);
      toast.error("Xatolik: " + err.message);
    }
  }

  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("intizom_user", JSON.stringify(data.user));
      localStorage.setItem("intizom_token", data.token);
      setUser(data.user);
      setToken(data.token);
      toast.success("Kirish muvaffaqiyatli!");
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }

  async function register(email, password, full_name) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("intizom_user", JSON.stringify(data.user));
      localStorage.setItem("intizom_token", data.token);
      setUser(data.user);
      setToken(data.token);
      toast.success("Ro'yxatdan o'tdingiz!");
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }

  function logout() {
    localStorage.removeItem("intizom_user");
    localStorage.removeItem("intizom_token");
    setUser(null);
    setToken(null);
  }

  function updateProfile(updates) {
    const next = { ...user, ...updates };
    localStorage.setItem("intizom_user", JSON.stringify(next));
    setUser(next);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
