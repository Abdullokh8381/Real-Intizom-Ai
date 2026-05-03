import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, Mail, Lock, Save, Sun, Moon, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  var { user, updateProfile } = useAuth();
  var { isDark, toggleTheme } = useTheme();
  var [name, setName] = useState(user ? user.full_name : "");
  var [oldPw, setOldPw] = useState("");
  var [newPw, setNewPw] = useState("");
  var [confirmPw, setConfirmPw] = useState("");
  var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function handleSaveName() {
    if (!name.trim()) return;
    updateProfile({ full_name: name.trim() });
    toast.success("Ism yangilandi");
  }

  function handleChangePw(e) {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("Kamida 6 belgi"); return; }
    if (newPw !== confirmPw) { toast.error("Parollar mos kelmadi"); return; }
    var users = JSON.parse(localStorage.getItem("intizom_users") || "[]");
    var idx = users.findIndex(function (u) { return u.id === user.id; });
    if (idx >= 0 && users[idx].password === oldPw) {
      users[idx].password = newPw;
      localStorage.setItem("intizom_users", JSON.stringify(users));
      setOldPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Parol yangilandi");
    } else {
      toast.error("Eski parol xato");
    }
  }

  return (
    <div className="page-transition space-y-6 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Profil</h1>

      {/* Info */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <User size={20} className="text-primary-500" /> Shaxsiy malumotlar
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toliq ism</label>
          <div className="flex gap-2">
            <input type="text" value={name} onChange={function (e) { setName(e.target.value); }} className="input" />
            <button onClick={handleSaveName} className="btn btn-primary shrink-0"><Save size={18} /></button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Mail size={16} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">{user ? user.email : ""}</span>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Lock size={20} className="text-primary-500" /> Parolni ozgartirish
        </h2>
        <form onSubmit={handleChangePw} className="space-y-3">
          <input type="password" value={oldPw} onChange={function (e) { setOldPw(e.target.value); }} className="input" placeholder="Eski parol" required />
          <input type="password" value={newPw} onChange={function (e) { setNewPw(e.target.value); }} className="input" placeholder="Yangi parol" required />
          <input type="password" value={confirmPw} onChange={function (e) { setConfirmPw(e.target.value); }} className="input" placeholder="Yangi parolni tasdiqlang" required />
          <button type="submit" className="btn btn-primary">Parolni yangilash</button>
        </form>
      </div>

      {/* Settings */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Globe size={20} className="text-primary-500" /> Sozlamalar
        </h2>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {isDark ? <Moon size={18} className="text-gray-400" /> : <Sun size={18} className="text-amber-500" />}
            <span className="text-gray-700 dark:text-gray-300">Tema</span>
          </div>
          <button onClick={toggleTheme} className={"relative w-14 h-7 rounded-full transition-colors " + (isDark ? "bg-primary-600" : "bg-gray-300")}>
            <div className={"absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform " + (isDark ? "translate-x-7" : "translate-x-0.5")} />
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-700 dark:text-gray-300">Vaqt mintaqasi</span>
          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">{tz}</span>
        </div>
      </div>
    </div>
  );
}
