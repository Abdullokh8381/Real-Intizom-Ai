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
    <div className="page-transition space-y-8 max-w-3xl mx-auto pb-10">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/30 shadow-inner">
            {name ? name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight">{name || "Foydalanuvchi"}</h1>
            <p className="text-primary-100 flex items-center justify-center md:justify-start gap-2 mt-1">
              <Mail size={14} />
              {user ? user.email : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">Faol foydalanuvchi</span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                <Globe size={10} /> {tz}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          {/* Shaxsiy ma'lumotlar */}
          <div className="card group hover:border-primary-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600">
                <User size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Shaxsiy malumotlar</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Toliq ism</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={function (e) { setName(e.target.value); }} 
                      className="input pl-10 h-12 bg-gray-50/50 focus:bg-white transition-all" 
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                  <button onClick={handleSaveName} className="btn btn-primary px-6 h-12 flex items-center gap-2 shadow-lg shadow-primary-500/20">
                    <Save size={18} />
                    <span className="hidden sm:inline">Saqlash</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email manzili</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 cursor-not-allowed">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{user ? user.email : ""}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parol */}
          <div className="card group hover:border-primary-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600">
                <Lock size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Xavfsizlik</h2>
            </div>
            
            <form onSubmit={handleChangePw} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Eski parol</label>
                  <input type="password" value={oldPw} onChange={function (e) { setOldPw(e.target.value); }} className="input h-11 bg-gray-50/50" placeholder="••••••••" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Yangi parol</label>
                    <input type="password" value={newPw} onChange={function (e) { setNewPw(e.target.value); }} className="input h-11 bg-gray-50/50" placeholder="••••••••" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tasdiqlash</label>
                    <input type="password" value={confirmPw} onChange={function (e) { setConfirmPw(e.target.value); }} className="input h-11 bg-gray-50/50" placeholder="••••••••" required />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full btn bg-gray-900 dark:bg-white dark:text-gray-900 text-white h-12 font-bold hover:scale-[1.02] active:scale-95 transition-all">
                Parolni yangilash
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Settings */}
          <div className="card group hover:border-primary-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600">
                <Globe size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sozlamalar</h2>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className={"p-2 rounded-lg " + (isDark ? "bg-primary-900/40 text-primary-400" : "bg-amber-100 text-amber-600")}>
                    {isDark ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Tungi rejim</span>
                </div>
                <button 
                  onClick={toggleTheme} 
                  className={"relative w-12 h-6 rounded-full transition-all duration-300 " + (isDark ? "bg-primary-600" : "bg-gray-300")}
                >
                  <div className={"absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 " + (isDark ? "translate-x-7" : "translate-x-1")} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg text-primary-600">
                    <Globe size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Vaqt mintaqasi</span>
                </div>
                <div className="text-[11px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-xl border border-primary-100 dark:border-primary-900/50 text-center uppercase tracking-widest">
                  {tz}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Placeholder */}
          <div className="card bg-gradient-to-br from-gray-900 to-black text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Trophy size={100} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Profil holati</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>PROFIL TO'LDIRILISHI</span>
                  <span className="text-primary-400">85%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-primary-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">"Intizom — bu xohlagan narsangiz va eng ko'p xohlagan narsangiz o'rtasidagi tanlovdir."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  );
}
