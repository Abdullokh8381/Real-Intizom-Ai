import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { startOfWeek, format, isSameDay } from "date-fns";

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

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  const loadData = useCallback(async () => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchJson = (url) => fetch(url, { headers: getHeaders() }).then(r => r.ok ? r.json() : []);

      const [tRes, hRes, lRes, cRes] = await Promise.all([
        fetchJson(`${API_BASE}/tasks/${userId}`),
        fetchJson(`${API_BASE}/habits/${userId}`),
        fetchJson(`${API_BASE}/habit-logs/${userId}`),
        fetchJson(`${API_BASE}/challenges/${userId}`)
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

  // Tasks
  async function addTask(title, dayOfWeek, weekStart) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId, title, day_of_week: dayOfWeek, week_start: weekStart })
      });
      const newTask = await res.json();
      if (newTask.id) {
        setTasks(prev => [...prev, { ...newTask, isCompleted: newTask.is_completed, dayOfWeek: newTask.day_of_week, weekStart: newTask.week_start }]);
      }
    } catch (err) { console.error(err); }
  }

  async function toggleTask(taskId) {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
      await fetch(`${API_BASE}/tasks/${taskId}/toggle`, { method: 'PUT', headers: getHeaders() });
    } catch (err) { console.error(err); }
  }

  async function deleteTask(taskId) {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE', headers: getHeaders() });
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
      if (newHabit.id) {
        setHabits(prev => [...prev, { ...newHabit, goalDays: newHabit.goal_days, isActive: newHabit.is_active }]);
      }
    } catch (err) { console.error(err); }
  }

  async function deleteHabit(habitId) {
    try {
      setHabits(prev => prev.filter(h => h.id !== habitId));
      await fetch(`${API_BASE}/habits/${habitId}`, { method: 'DELETE', headers: getHeaders() });
    } catch (err) { console.error(err); }
  }

  // Habit Logs
  async function toggleHabitLog(habitId, date) {
    const logDate = format(date, "yyyy-MM-dd");
    try {
      // Optimistic update
      setHabitLogs(prev => {
        const existing = prev.find(l => l.habitId === habitId && l.logDate === logDate);
        if (existing) {
          return prev.map(l => (l.id === existing.id ? { ...l, isDone: !l.isDone } : l));
        }
        return [...prev, { habitId, logDate, isDone: true }];
      });

      await fetch(`${API_BASE}/habit-logs/toggle`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ habit_id: habitId, log_date: logDate })
      });
    } catch (err) { console.error(err); }
  }

  function isHabitDone(habitId, date) {
    const logDate = format(date, "yyyy-MM-dd");
    const log = habitLogs.find(l => l.habitId === habitId && l.logDate === logDate);
    return log ? log.isDone : false;
  }

  function getHabitWeekProgress(habitId, weekStart) {
    const start = new Date(weekStart);
    let doneCount = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (isHabitDone(habitId, d)) doneCount++;
    }
    return { count: doneCount, percentage: Math.round((doneCount / 7) * 100) };
  }

  function getDayStats(weekStart, dayOfWeek) {
    const dayTasks = tasks.filter((t) => t.weekStart === weekStart && t.dayOfWeek === dayOfWeek);
    const total = dayTasks.length;
    const completed = dayTasks.filter((t) => t.isCompleted).length;
    return {
      completed, total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  const value = {
    tasks, habits, habitLogs, challenges, loading,
    addTask, toggleTask, deleteTask, getDayStats,
    addHabit, deleteHabit, toggleHabitLog, isHabitDone, getHabitWeekProgress,
    getWeekStart: (date) => format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    getWeekTasks: (weekStart) => tasks.filter((t) => t.weekStart === weekStart),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
