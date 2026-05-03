import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { startOfWeek, format, addDays } from "date-fns";

const DataContext = createContext(null);
const API_BASE = "https://intizom-backend-ibcz.onrender.com/api";

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children, userId, token }) {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Avtorizatsiya uchun headerlar
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  const loadData = useCallback(async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const [tRes, hRes, lRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/tasks/${userId}`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/habits/${userId}`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/habit-logs/${userId}`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/challenges/${userId}`, { headers: getHeaders() }).then(r => r.json())
      ]);
      
      setTasks(Array.isArray(tRes) ? tRes.map(t => ({ ...t, isCompleted: t.is_completed, dayOfWeek: t.day_of_week, weekStart: t.week_start })) : []);
      setHabits(Array.isArray(hRes) ? hRes.map(h => ({ ...h, goalDays: h.goal_days, isActive: h.is_active })) : []);
      setHabitLogs(Array.isArray(lRes) ? lRes.map(l => ({ ...l, habitId: l.habit_id, logDate: l.log_date, isDone: l.is_done })) : []);
      setChallenges(Array.isArray(cRes) ? cRes : []);
    } catch (err) {
      console.error("Yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, token, getHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addTask(title, dayOfWeek, weekStart) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId, title, day_of_week: dayOfWeek, week_start: weekStart })
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, { ...newTask, isCompleted: newTask.is_completed, dayOfWeek: newTask.day_of_week, weekStart: newTask.week_start }]);
    } catch (err) { console.error(err); }
  }

  async function toggleTask(taskId) {
    try {
      await fetch(`${API_BASE}/tasks/${taskId}/toggle`, { method: 'PUT', headers: getHeaders() });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    } catch (err) { console.error(err); }
  }

  async function deleteTask(taskId) {
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE', headers: getHeaders() });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) { console.error(err); }
  }

  // Habits
  async function addHabit(data) {
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId, name: data.name, color: data.color, priority: data.priority, goal_days: data.goalDays })
      });
      const newHabit = await res.json();
      setHabits(prev => [...prev, { ...newHabit, goalDays: newHabit.goal_days, isActive: newHabit.is_active }]);
    } catch (err) { console.error(err); }
  }

  async function deleteHabit(habitId) {
    try {
      await fetch(`${API_BASE}/habits/${habitId}`, { method: 'DELETE', headers: getHeaders() });
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) { console.error(err); }
  }

  function getDayStats(weekStart, dayOfWeek) {
    const dayTasks = tasks.filter((t) => t.weekStart === weekStart && t.dayOfWeek === dayOfWeek);
    const completed = dayTasks.filter((t) => t.isCompleted).length;
    const total = dayTasks.length;
    return {
      completed, total,
      notCompleted: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  const value = {
    tasks, habits, loading,
    addTask, toggleTask, deleteTask, getDayStats,
    addHabit, deleteHabit,
    getWeekStart: (date) => format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    getWeekTasks: (weekStart) => tasks.filter((t) => t.weekStart === weekStart),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
