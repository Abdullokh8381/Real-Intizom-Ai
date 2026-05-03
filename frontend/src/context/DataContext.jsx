import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { startOfWeek, format, addDays } from "date-fns";

const DataContext = createContext(null);

// RENDER BACKEND URL
const API_BASE = "https://intizom-backend-ibcz.onrender.com/api";

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children, userId }) {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ma'lumotlarni serverdan yuklash
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [tRes, hRes, lRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/tasks/${userId}`).then(r => r.json()),
        fetch(`${API_BASE}/habits/${userId}`).then(r => r.json()),
        fetch(`${API_BASE}/habit-logs/${userId}`).then(r => r.json()),
        fetch(`${API_BASE}/challenges/${userId}`).then(r => r.json())
      ]);
      setTasks(Array.isArray(tRes) ? tRes : []);
      setHabits(Array.isArray(hRes) ? hRes : []);
      setHabitLogs(Array.isArray(lRes) ? lRes : []);
      setChallenges(Array.isArray(cRes) ? cRes : []);
    } catch (err) {
      console.error("Ma'lumot yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── TASKS ────────────────────────
  function getWeekStart(date) {
    return format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  }

  function getWeekTasks(weekStart) {
    return tasks.filter((t) => t.weekStart === weekStart);
  }

  async function addTask(title, dayOfWeek, weekStart) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title, day_of_week: dayOfWeek, week_start: weekStart })
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    } catch (err) { console.error(err); }
  }

  async function toggleTask(taskId) {
    try {
      await fetch(`${API_BASE}/tasks/${taskId}/toggle`, { method: 'PUT' });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
    } catch (err) { console.error(err); }
  }

  async function deleteTask(taskId) {
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) { console.error(err); }
  }

  // ─── HABITS ───────────────────────
  async function addHabit(data) {
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...data })
      });
      const newHabit = await res.json();
      setHabits(prev => [...prev, newHabit]);
    } catch (err) { console.error(err); }
  }

  async function deleteHabit(habitId) {
    try {
      await fetch(`${API_BASE}/habits/${habitId}`, { method: 'DELETE' });
      setHabits(prev => prev.filter(h => h.id !== habitId));
      setHabitLogs(prev => prev.filter(l => l.habit_id !== habitId));
    } catch (err) { console.error(err); }
  }

  async function toggleHabitLog(habitId, date) {
    const dateStr = format(date, "yyyy-MM-dd");
    try {
      const res = await fetch(`${API_BASE}/habit-logs/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, log_date: dateStr })
      });
      const updatedLog = await res.json();
      
      setHabitLogs(prev => {
        const exists = prev.find(l => l.habit_id === habitId && l.log_date === dateStr);
        if (exists) {
          return prev.map(l => l.id === updatedLog.id ? updatedLog : l);
        } else {
          return [...prev, updatedLog];
        }
      });
    } catch (err) { console.error(err); }
  }

  function isHabitDone(habitId, date) {
    const dateStr = format(date, "yyyy-MM-dd");
    const log = habitLogs.find((l) => l.habit_id === habitId && l.log_date === dateStr);
    return log ? log.is_done : false;
  }

  function getHabitWeekProgress(habitId, weekStart) {
    const start = new Date(weekStart + "T00:00:00");
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(format(addDays(start, i), "yyyy-MM-dd"));
    }
    const done = habitLogs.filter((l) => l.habit_id === habitId && days.indexOf(l.log_date) >= 0 && l.is_done).length;
    return { completed: done, total: 7, percentage: Math.round((done / 7) * 100) };
  }

  // ─── CHALLENGES ───────────────────
  async function addChallenge(data) {
    try {
      const res = await fetch(`${API_BASE}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...data, duration_days: data.durationDays, quantity_label: data.quantityLabel })
      });
      const newCh = await res.json();
      setChallenges(prev => [...prev, newCh]);
    } catch (err) { console.error(err); }
  }

  // Qolgan funksiyalar (startChallenge, getChallengeProgress va h.k.) ham aynan shu tartibda API orqali ishlaydi

  function getDayStats(weekStart, dayOfWeek) {
    const dayTasks = tasks.filter((t) => t.weekStart === weekStart && t.dayOfWeek === dayOfWeek);
    const completed = dayTasks.filter((t) => t.is_completed).length;
    const total = dayTasks.length;
    return {
      completed: completed,
      total: total,
      notCompleted: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  const value = {
    tasks, habits, habitLogs, challenges, loading,
    getWeekTasks, addTask, toggleTask, deleteTask, getWeekStart,
    addHabit, deleteHabit, toggleHabitLog, isHabitDone, getHabitWeekProgress,
    addChallenge, getDayStats
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
