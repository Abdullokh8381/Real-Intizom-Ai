import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Leaf, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function Login() {
  var { login, googleLogin } = useAuth();
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [showPw, setShowPw] = useState(false);
  var [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    var result = login(email, password);
    if (result.success) {
      toast.success("Xush kelibsiz!");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-emerald-50 to-green-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl mb-4 shadow-lg">
            <Leaf className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent mb-2">
            Intizom AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Odatlar va vazifalarni boshqaring</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50 dark:border-gray-800/50">
          <div className="flex items-center gap-2 mb-6">
            <LogIn className="text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kirish</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                placeholder="email@misol.com"
              />
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
                  placeholder="Parolingiz"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-base">
              {loading ? "Kirish..." : "Kirish"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Yoki</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                googleLogin(credentialResponse.credential);
              }}
              onError={() => {
                toast.error("Google orqali kirishda xato yuz berdi");
              }}
              useOneTap
              theme="filled_blue"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {"Hisobingiz yo'qmi? "}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              {"Ro'yxatdan o'tish"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
