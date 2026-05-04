import { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { format, addDays, isToday } from "date-fns";
import { uz } from "date-fns/locale";
import { 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Calendar as CalendarIcon 
} from "lucide-react";

var DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
var DAYS_SHORT = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];

function CircularProgress({ percentage, size, strokeWidth }) {
  var s = size || 56;
  var sw = strokeWidth || 5;
  var radius = (s - sw) / 2;
  var circ = radius * 2 * Math.PI;
  var offset = circ - (percentage / 100) * circ;
  var color = percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={s} height={s} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={s / 2} cy={s / 2} r={radius} stroke="currentColor" strokeWidth={sw} fill="none" className="text-gray-200 dark:text-gray-800" />
        <circle
          cx={s / 2}
          cy={s / 2}
          r={radius}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-gray-700 dark:text-gray-300">{percentage}%</span>
    </div>
  );
}

export default function Dashboard() {
  var navigate = useNavigate();
  var data = useData();
  var [currentWeek, setCurrentWeek] = useState(data.getWeekStart());
  var [addingDay, setAddingDay] = useState(null);
  var [newTitle, setNewTitle] = useState("");
  var [now, setNow] = useState(new Date());

  useEffect(function () {
    var timer = setInterval(function () { setNow(new Date()); }, 1000);
    return function () { clearInterval(timer); };
  }, []);

  var weekTasks = useMemo(function () { 
    return data.getWeekTasks(currentWeek); 
  }, [data.tasks, currentWeek]);

  var weekDates = useMemo(function () {
    var start = new Date(currentWeek + "T00:00:00");
    var arr = [];
    for (var i = 0; i < 7; i++) arr.push(addDays(start, i));
    return arr;
  }, [currentWeek]);

  var weekStats = useMemo(function () {
    var total = weekTasks.length;
    var done = weekTasks.filter(function (t) { return t.isCompleted; }).length;
    return { 
      total: total, 
      completed: done, 
      percentage: total > 0 ? Math.round((done / total) * 100) : 0 
    };
  }, [weekTasks]);

  var activeHabits = useMemo(function () {
    return data.habits.filter(function (h) { return h.isActive; });
  }, [data.habits]);

  var activeChallenges = useMemo(function () {
    return data.challenges.filter(function (c) { return c.status === "active"; });
  }, [data.challenges]);

  var tz = useMemo(function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  var isCurrentWeek = useMemo(function () {
    return currentWeek === data.getWeekStart(now);
  }, [currentWeek, now, data]);

  function handleAddTask(dayIndex) {
    if (!newTitle.trim()) return;
    data.addTask(newTitle.trim(), dayIndex, currentWeek);
    setNewTitle("");
    setAddingDay(null);
  }

  function navWeek(dir) {
    var start = new Date(currentWeek + "T00:00:00");
    setCurrentWeek(format(addDays(start, dir * 7), "yyyy-MM-dd"));
  }

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Bugun: <span className="text-primary-600 dark:text-primary-400 font-medium">
              {format(now, "EEEE, d-MMMM", { locale: uz })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card-compact flex items-center gap-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Clock size={18} />
              <span className="text-lg font-mono font-bold">
                {format(now, "HH:mm:ss")}
              </span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <MapPin size={14} />
              <span>{tz}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 shadow-sm">
            <button onClick={function () { navWeek(-1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-1 text-center min-w-[140px]">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Hafta boshlanishi</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {format(new Date(currentWeek + "T00:00:00"), "dd.MM.yyyy")}
              </p>
            </div>
            <button onClick={function () { navWeek(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          {!isCurrentWeek && (
            <button 
              onClick={function() { setCurrentWeek(data.getWeekStart()); }}
              className="btn bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 px-4"
            >
              Bugun
            </button>
          )}
        </div>

        <div className="card-compact flex items-center gap-4 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <CircularProgress percentage={weekStats.percentage} size={48} strokeWidth={4} />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Haftalik umumiy</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {weekStats.completed + " / " + weekStats.total + " vazifa"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDates.map(function (date, dayIndex) {
              var dayTasks = weekTasks.filter(function (t) { return t.dayOfWeek === dayIndex; });
              var stats = data.getDayStats(currentWeek, dayIndex);
              var today = isToday(date);

              return (
                <div 
                  key={dayIndex} 
                  className={"day-card p-4 flex flex-col " + (today ? "today border-primary-500 ring-2 ring-primary-500/10 shadow-lg" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={"font-bold text-sm " + (today ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-gray-100")}>
                        {DAYS[dayIndex]}
                        {today && <span className="ml-2 text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded uppercase">Bugun</span>}
                      </h3>
                      <p className="text-xs text-gray-400">{format(date, "d-MMMM", { locale: uz })}</p>
                    </div>
                    <CircularProgress percentage={stats.percentage} size={36} strokeWidth={3} />
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
                    {dayTasks.length === 0 && addingDay !== dayIndex && (
                      <p className="text-[10px] text-gray-300 text-center py-4 italic">Vazifalar yo'q</p>
                    )}
                    {dayTasks.map(function (task) {
                      return (
                        <div key={task.id} className="flex items-start gap-2 group">
                          <input 
                            type="checkbox" 
                            checked={task.isCompleted} 
                            onChange={function () { data.toggleTask(task.id); }} 
                            className="habit-check mt-0.5" 
                          />
                          <span className={"text-xs leading-relaxed flex-1 " + (task.isCompleted ? "task-completed" : "text-gray-700 dark:text-gray-300")}>
                            {task.title}
                          </span>
                          <button onClick={function () { data.deleteTask(task.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {addingDay === dayIndex ? (
                    <div className="mt-3 flex gap-1">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={function (e) { setNewTitle(e.target.value); }}
                        onKeyDown={function (e) { if (e.key === "Enter") handleAddTask(dayIndex); }}
                        placeholder="Vazifa..."
                        className="input text-xs py-1.5 px-2 bg-gray-50 dark:bg-gray-800"
                        autoFocus
                      />
                      <button onClick={function () { handleAddTask(dayIndex); }} className="btn btn-primary p-1.5 shrink-0"><Check size={14} /></button>
                      <button onClick={function () { setAddingDay(null); setNewTitle(""); }} className="btn btn-secondary p-1.5 shrink-0"><X size={14} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={function () { setAddingDay(dayIndex); setNewTitle(""); }}
                      className="mt-3 py-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-bold text-gray-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus size={12} />
                      <span>VAZIFA QO'SHISH</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* New Challenges Section */}
          <div className="card shadow-xl border-gray-100 dark:border-gray-800 overflow-hidden p-0">
            <div className="bg-primary-600 p-3">
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                <Trophy size={18} />
                Haftalik Chellenjlar
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.length === 0 ? (
                <div className="col-span-full text-center py-6">
                  <p className="text-xs font-medium text-gray-400">Faol chellenjlar yo'q</p>
                  <button onClick={function() { navigate('/challenges') }} className="mt-2 text-xs text-primary-600 font-bold hover:underline uppercase tracking-wider">YANGI QO'SHISH</button>
                </div>
              ) : (
                activeChallenges.map(function (ch) {
                  var habitId = ch.habitId || ch.habit_id;
                  var progress = habitId ? data.getHabitWeekProgress(habitId, currentWeek) : { percentage: 0 };
                  
                  return (
                    <div key={ch.id} className="space-y-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 group hover:border-primary-200 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">⭐</span>
                          <div className="min-w-0">
                            <span className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase truncate block">{ch.name}</span>
                            <p className="text-[9px] text-gray-400 font-bold truncate">{ch.quantity_label || ch.quantityLabel}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-primary-600">{progress.percentage}%</span>
                      </div>
                      
                      <div className="flex justify-between gap-1">
                        {weekDates.map(function (date, i) {
                          var done = habitId ? data.isHabitDone(habitId, date) : false;
                          return (
                            <button
                              key={i}
                              disabled={!habitId}
                              onClick={function () { if (habitId) data.toggleHabitLog(habitId, date); }}
                              className={
                                "flex-1 h-7 rounded-lg text-[9px] font-black transition-all border " + 
                                (done 
                                  ? "bg-primary-500 border-primary-500 text-white shadow-sm" 
                                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 hover:border-primary-300"
                                )
                              }
                            >
                              {DAYS_SHORT[i]}
                            </button>
                          );
                        })}
                      </div>

                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-1000" 
                          style={{ width: progress.percentage + "%" }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="card sticky top-8 shadow-xl border-gray-100 dark:border-gray-800 overflow-hidden p-0">
            <div className="bg-primary-600 p-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <CalendarIcon size={18} />
                Haftalik Odatlar
              </h2>
            </div>
            
            <div className="p-5 space-y-6">
              {(function() {
                var regularHabits = activeHabits.filter(function(h) {
                  var isLinkedToChallenge = data.challenges.some(function(c) { 
                    return String(c.habitId || c.habit_id) === String(h.id); 
                  });
                  var hasChallengeName = h.name.startsWith("Chellenj: ");
                  return !isLinkedToChallenge && !hasChallengeName;
                });

                if (regularHabits.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <p className="text-sm font-medium text-gray-400">Odatlar qo'shilmagan</p>
                      <button onClick={function() { navigate('/habits') }} className="mt-3 text-xs text-primary-600 font-bold hover:underline">YANGI QO'SHISH</button>
                    </div>
                  );
                }

                return regularHabits.map(function (habit) {
                  var progress = data.getHabitWeekProgress(habit.id, currentWeek);
                  return (
                    <div key={habit.id} className="space-y-3 pb-4 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{habit.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between gap-1">
                        {weekDates.map(function (date, i) {
                          var done = data.isHabitDone(habit.id, date);
                          return (
                            <button
                              key={i}
                              onClick={function () { data.toggleHabitLog(habit.id, date); }}
                              className={
                                "flex-1 h-8 rounded-lg text-[10px] font-bold transition-all border-2 " + 
                                (done 
                                  ? "bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20" 
                                  : "bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400 hover:border-gray-200"
                                )
                              }
                            >
                              {DAYS_SHORT[i]}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div 
                            className="progress-bar h-1.5 bg-primary-500" 
                            style={{ width: progress.percentage + "%", backgroundColor: habit.color }} 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 w-8">{progress.percentage}%</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
