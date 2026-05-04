import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Leaf, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

export default function Register() {
  var { register } = useAuth();
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [confirm, setConfirm] = useState("");
  var [showPw, setShowPw] = useState(false);
  var [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bolishi kerak");
      return;
    }
    if (password !== confirm) {
      toast.error("Parollar mos kelmadi");
      return;
    }
    setLoading(true);
    var result = register(email, password, name);
    if (result.success) {
      toast.success("Hisob yaratildi!");
    } else {
      // toast.error(result.error);
      // Bu ortiqcha, chunki AuthContext o'zi chiqaradi
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-emerald-50 to-green-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo iconSize={48} textClass="text-4xl" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Yangi hisob yarating</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50 dark:border-gray-800/50">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{"Ro'yxatdan o'tish"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required placeholder="Ismingiz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required placeholder="email@misol.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  required
                  placeholder="Kamida 6 belgi"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parolni tasdiqlang</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" required placeholder="Parolni qaytaring" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-base">
              {loading ? "Yaratilmoqda..." : "Hisob yaratish"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {"Hisobingiz bormi? "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
