import { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

var MonthlyReport = lazy(function () { return import("./pages/MonthlyReport"); });
var HabitsList = lazy(function () { return import("./pages/HabitsList"); });
var Challenges = lazy(function () { return import("./pages/Challenges"); });
var Competition = lazy(function () { return import("./pages/Competition"); });
var Profile = lazy(function () { return import("./pages/Profile"); });

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Nimadir xato ketdi</h2>
          <p className="text-gray-600 mb-4">Ilovani qayta yuklab ko'ring</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Qayta yuklash</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
}

function PrivateRoute({ children }) {
  var { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  var { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/dashboard" /> : children;
}

function AppContent() {
  var { user } = useAuth();

  return (
    <DataProvider userId={user ? user.id : null}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", padding: "16px", fontSize: "14px", fontWeight: "500" },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
            style: { background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" },
          },
        }}
      />
      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reports" element={<MonthlyReport />} />
              <Route path="habits" element={<HabitsList />} />
              <Route path="challenges" element={<Challenges />} />
              <Route path="competition" element={<Competition />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </DataProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
