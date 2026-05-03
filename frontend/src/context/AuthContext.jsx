import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("intizom_user");
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      localStorage.removeItem("intizom_user");
    }
    setLoading(false);
  }, []);

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem("intizom_users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Email yoki parol xato" };
    const data = { id: found.id, email: found.email, full_name: found.full_name };
    localStorage.setItem("intizom_user", JSON.stringify(data));
    setUser(data);
    return { success: true };
  }

  function register(email, password, full_name) {
    const users = JSON.parse(localStorage.getItem("intizom_users") || "[]");
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Bu email allaqachon mavjud" };
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      full_name,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("intizom_users", JSON.stringify(users));
    const data = { id: newUser.id, email: newUser.email, full_name: newUser.full_name };
    localStorage.setItem("intizom_user", JSON.stringify(data));
    setUser(data);
    return { success: true };
  }

  async function googleLogin(credential) {
    try {
      const res = await fetch("https://intizom-backend-ibcz.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("intizom_user", JSON.stringify(data));
      setUser(data);
      toast.success("Google orqali kirdingiz!");
    } catch (err) {
      console.error(err);
      toast.error("Xatolik: " + err.message);
    }
  }

  function logout() {
    localStorage.removeItem("intizom_user");
    setUser(null);
  }

  function updateProfile(updates) {
    const next = { ...user, ...updates };
    localStorage.setItem("intizom_user", JSON.stringify(next));
    setUser(next);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
