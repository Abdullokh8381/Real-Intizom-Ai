import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  BarChart3,
  ListChecks,
  Trophy,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Leaf,
  StickyNote,
} from "lucide-react";
import Logo from "./Logo";

var NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { to: "/reports", icon: BarChart3, label: "Hisobotlar" },
  { to: "/habits", icon: ListChecks, label: "Odatlar" },
  { to: "/challenges", icon: Trophy, label: "Chellenjlar" },
  { to: "/competition", icon: Users, label: "Musobaqa" },
  { to: "/notes", icon: StickyNote, label: "Eslatmalar" },
  { to: "/profile", icon: User, label: "Profil" },
];

export default function Layout() {
  var { user, logout } = useAuth();
  var { isDark, toggleTheme } = useTheme();
  var [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Logo iconSize={32} textClass="text-xl" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={
          "fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 z-20 transition-transform duration-300 lg:translate-x-0 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 mt-14 lg:mt-0">
          <div className="hidden lg:flex items-center mb-6">
            <Logo iconSize={36} textClass="text-2xl" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {user ? user.full_name : "Foydalanuvchi"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user ? user.email : ""}
          </p>
          <button
            onClick={toggleTheme}
            className="mt-3 flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            <span>{isDark ? "Qorong'u" : "Yorug'"}</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          {NAV_ITEMS.map(function (item) {
            var Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={function ({ isActive }) {
                  return (
                    "flex items-center gap-3 px-4 py-3 rounded-lg mb-1.5 transition-all " +
                    (isActive
                      ? "bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-100 dark:border-primary-900/50"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800")
                  );
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={function () {
              logout();
              closeMobile();
            }}
            className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg w-full transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
