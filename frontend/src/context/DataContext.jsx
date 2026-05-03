import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { startOfWeek, format, addDays } from "date-fns";

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

function storageKey(userId, key) {
  return "intizom_" + userId + "_" + key;
}

function loadArray(userId, key) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId, key)) || "[]");
  } catch {
    return [];
  }
}

export function DataProvider({ children, userId }) {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeLogs, setChallengeLogs] = useState([]);

  useEffect(() => {
    if (!userId) return;
    setTasks(loadArray(userId, "tasks"));
    setHabits(loadArray(userId, "habits"));
    setHabitLogs(loadArray(userId, "habit_logs"));
    setChallenges(loadArray(userId, "challenges"));
    setChallengeLogs(loadArray(userId, "challenge_logs"));
  }, [userId]);

  const save = useCallback(
    (key, data) => {
      if (userId) localStorage.setItem(storageKey(userId, key), JSON.stringify(data));
    },
    [userId]
  );

  // ─── TASKS ────────────────────────
  function getWeekStart(date) {
    return format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  }

  function getWeekTasks(weekStart) {
    return tasks.filter((t) => t.weekStart === weekStart);
  }

  function addTask(title, dayOfWeek, weekStart) {
    var next = [
      ...tasks,
      {
        id: Date.now().toString(),
        title: title,
        dayOfWeek: dayOfWeek,
        weekStart: weekStart,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setTasks(next);
    save("tasks", next);
  }

  function toggleTask(taskId) {
    var next = tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(next);
    save("tasks", next);
  }

  function deleteTask(taskId) {
    var next = tasks.filter((t) => t.id !== taskId);
    setTasks(next);
    save("tasks", next);
  }

  // ─── HABITS ───────────────────────
  function addHabit(data) {
    var next = [
      ...habits,
      {
        id: Date.now().toString(),
        name: data.name,
        color: data.color || "#22c55e",
        priority: data.priority || 5,
        goalDays: data.goalDays || null,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    setHabits(next);
    save("habits", next);
  }

  function updateHabit(habitId, updates) {
    var next = habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h));
    setHabits(next);
    save("habits", next);
  }

  function deleteHabit(habitId) {
    var nextH = habits.filter((h) => h.id !== habitId);
    var nextL = habitLogs.filter((l) => l.habitId !== habitId);
    setHabits(nextH);
    setHabitLogs(nextL);
    save("habits", nextH);
    save("habit_logs", nextL);
  }

  function toggleHabitLog(habitId, date) {
    var dateStr = format(date, "yyyy-MM-dd");
    var existing = habitLogs.find((l) => l.habitId === habitId && l.logDate === dateStr);
    var next;
    if (existing) {
      next = habitLogs.map((l) =>
        l.habitId === habitId && l.logDate === dateStr ? { ...l, isDone: !l.isDone } : l
      );
    } else {
      next = [...habitLogs, { id: Date.now().toString(), habitId: habitId, logDate: dateStr, isDone: true }];
    }
    setHabitLogs(next);
    save("habit_logs", next);
  }

  function isHabitDone(habitId, date) {
    var dateStr = format(date, "yyyy-MM-dd");
    var log = habitLogs.find((l) => l.habitId === habitId && l.logDate === dateStr);
    return log ? log.isDone : false;
  }

  function getHabitWeekProgress(habitId, weekStart) {
    var start = new Date(weekStart + "T00:00:00");
    var days = [];
    for (var i = 0; i < 7; i++) {
      days.push(format(addDays(start, i), "yyyy-MM-dd"));
    }
    var done = habitLogs.filter((l) => l.habitId === habitId && days.indexOf(l.logDate) >= 0 && l.isDone).length;
    return { completed: done, total: 7, percentage: Math.round((done / 7) * 100) };
  }

  // ─── CHALLENGES ───────────────────
  function addChallenge(data) {
    var next = [
      ...challenges,
      {
        id: Date.now().toString(),
        name: data.name,
        description: data.description || "",
        durationDays: data.durationDays,
        quantityLabel: data.quantityLabel || "",
        status: "not_started",
        startDate: null,
        endDate: null,
        createdAt: new Date().toISOString(),
      },
    ];
    setChallenges(next);
    save("challenges", next);
  }

  function startChallenge(challengeId) {
    var ch = challenges.find((c) => c.id === challengeId);
    if (!ch) return;
    var today = new Date();
    var end = addDays(today, ch.durationDays);
    var next = challenges.map((c) =>
      c.id === challengeId
        ? { ...c, status: "active", startDate: format(today, "yyyy-MM-dd"), endDate: format(end, "yyyy-MM-dd") }
        : c
    );
    setChallenges(next);
    save("challenges", next);
  }

  function deleteChallenge(challengeId) {
    var next = challenges.filter((c) => c.id !== challengeId);
    setChallenges(next);
    save("challenges", next);
  }

  function getChallengeProgress(challengeId) {
    var ch = challenges.find((c) => c.id === challengeId);
    if (!ch || ch.status !== "active") return { completed: 0, total: 0, percentage: 0 };
    var done = challengeLogs.filter((l) => l.challengeId === challengeId && l.isDone).length;
    return {
      completed: done,
      total: ch.durationDays,
      percentage: Math.round((done / ch.durationDays) * 100),
    };
  }

  // ─── STATS ────────────────────────
  function getDayStats(weekStart, dayOfWeek) {
    var dayTasks = tasks.filter((t) => t.weekStart === weekStart && t.dayOfWeek === dayOfWeek);
    var completed = dayTasks.filter((t) => t.isCompleted).length;
    var total = dayTasks.length;
    return {
      completed: completed,
      total: total,
      notCompleted: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  var value = {
    tasks,
    getWeekTasks,
    addTask,
    toggleTask,
    deleteTask,
    getWeekStart,
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,
    isHabitDone,
    getHabitWeekProgress,
    habitLogs,
    challenges,
    addChallenge,
    startChallenge,
    deleteChallenge,
    getChallengeProgress,
    challengeLogs,
    getDayStats,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
