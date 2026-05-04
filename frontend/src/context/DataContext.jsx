import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
  const [competitions, setCompetitions] = useState([]);
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
      const fetchJson = (url) => fetch(`${url}?t=${Date.now()}`, { headers: getHeaders() }).then(r => r.ok ? r.json() : []);

      const [tRes, hRes, lRes, cRes, compRes] = await Promise.all([
        fetchJson(`${API_BASE}/tasks/${userId}`),
        fetchJson(`${API_BASE}/habits/${userId}`),
        fetchJson(`${API_BASE}/habit-logs/${userId}`),
        fetchJson(`${API_BASE}/challenges/${userId}`),
        fetchJson(`${API_BASE}/competitions/${userId}`)
      ]);
      
      setTasks(Array.isArray(tRes) ? tRes.map(t => ({ ...t, isCompleted: t.is_completed, dayOfWeek: t.day_of_week, weekStart: t.week_start })) : []);
      setHabits(Array.isArray(hRes) ? hRes.map(h => ({ ...h, goalDays: h.goal_days, isActive: h.is_active })) : []);
      setHabitLogs(Array.isArray(lRes) ? lRes.map(l => ({ ...l, habitId: l.habit_id, logDate: l.log_date, isDone: l.is_done })) : []);
      setChallenges(Array.isArray(cRes) ? cRes : []);
      setCompetitions(Array.isArray(compRes) ? compRes : []);
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

  async function updateHabit(habitId, data) {
    try {
      const res = await fetch(`${API_BASE}/habits/${habitId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: data.name, color: data.color, priority: data.priority, goal_days: data.goalDays })
      });
      const updated = await res.json();
      setHabits(prev => prev.map(h => h.id === habitId ? { ...updated, goalDays: updated.goal_days, isActive: updated.is_active } : h));
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
      // Optimistic update: ID dan tashqari habitId va logDate orqali ham tekshiramiz
      setHabitLogs(prev => {
        const existing = prev.find(l => String(l.habitId) === String(habitId) && l.logDate === logDate);
        if (existing) {
          return prev.map(l => (l === existing ? { ...l, isDone: !l.isDone } : l));
        }
        return [...prev, { habitId, logDate, isDone: true }];
      });

      const res = await fetch(`${API_BASE}/habit-logs/toggle`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ habit_id: habitId, log_date: logDate })
      });
      const updatedLog = await res.json();
      
      // Serverdan haqiqiy ID ni olib, holatni yangilaymiz
      setHabitLogs(prev => prev.map(l => 
        (String(l.habitId) === String(habitId) && l.logDate === logDate) ? { ...updatedLog, habitId: updatedLog.habit_id, logDate: updatedLog.log_date, isDone: updatedLog.is_done } : l
      ));

      // Musobaqa progressini yangilash uchun ma'lumotlarni qayta yuklaymiz
      const compRes = await fetch(`${API_BASE}/competitions/${userId}?t=${Date.now()}`, { headers: getHeaders() }).then(r => r.json());
      setCompetitions(Array.isArray(compRes) ? compRes : []);
    } catch (err) { 
      console.error(err);
      loadData(); // Xato bo'lsa ma'lumotlarni qayta yuklaymiz
    }
  }

  function isHabitDone(habitId, date) {
    const logDate = format(date, "yyyy-MM-dd");
    const log = habitLogs.find(l => String(l.habitId) === String(habitId) && l.logDate === logDate);
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

  async function searchUserByEmail(email) {
    try {
      const res = await fetch(`${API_BASE}/users/search?email=${encodeURIComponent(email)}`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function sendCompetitionInvite(receiverEmail, title, startDate, endDate, note) {
    try {
      const res = await fetch(`${API_BASE}/competitions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sender_id: userId, receiver_email: receiverEmail, title, start_date: startDate, end_date: endDate, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Backend returns sender_name etc by joining users table. We need to reload to get those properly formatted, or just do loadData()
      loadData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function respondToCompetition(compId, status) {
    try {
      const res = await fetch(`${API_BASE}/competitions/${compId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCompetitions(prev => prev.map(c => c.id === compId ? { ...c, status } : c));
      if (status === 'active') {
        loadData(); // reload to get new habits
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
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

  const value = useMemo(() => ({
    tasks, habits, habitLogs, challenges, competitions, loading,
    addTask, toggleTask, deleteTask, getDayStats,
    addHabit, updateHabit, deleteHabit, toggleHabitLog, isHabitDone, getHabitWeekProgress,
    searchUserByEmail, sendCompetitionInvite, respondToCompetition,
    loadData,
    getWeekStart: (date) => format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    getWeekTasks: (weekStart) => tasks.filter((t) => t.weekStart === weekStart),
  }), [tasks, habits, habitLogs, challenges, competitions, loading, addTask, toggleTask, deleteTask, addHabit, updateHabit, deleteHabit, toggleHabitLog, searchUserByEmail, sendCompetitionInvite, respondToCompetition, loadData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
