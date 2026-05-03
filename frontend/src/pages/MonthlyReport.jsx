import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { uz } from "date-fns/locale";
import { BarChart3, TrendingUp, TrendingDown, Award, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function MonthlyReport() {
  var data = useData();
  var [currentDate, setCurrentDate] = useState(new Date());

  var monthStart = startOfMonth(currentDate);
  var monthEnd = endOfMonth(currentDate);
  var daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  var taskStats = useMemo(function () {
    var monthStr = format(currentDate, "yyyy-MM");
    var monthTasks = data.tasks.filter(function (t) {
      return (t.weekStart && t.weekStart.startsWith(monthStr)) || (t.createdAt && t.createdAt.startsWith(monthStr));
    });
    var completed = monthTasks.filter(function (t) { return t.isCompleted; }).length;
    var total = monthTasks.length;
    return {
      total: total,
      completed: completed,
      notCompleted: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [data.tasks, currentDate]);

  var habitStats = useMemo(function () {
    var monthDays = daysInMonth.map(function (d) { return format(d, "yyyy-MM-dd"); });
    return data.habits.filter(function (h) { return h.isActive; }).map(function (habit) {
      var logs = data.habitLogs.filter(function (l) { return l.habitId === habit.id && monthDays.indexOf(l.logDate) >= 0 && l.isDone; });
      var total = daysInMonth.length;
      return { id: habit.id, name: habit.name, color: habit.color, completed: logs.length, total: total, percentage: Math.round((logs.length / total) * 100) };
    });
  }, [data.habits, data.habitLogs, daysInMonth]);

  function navMonth(dir) {
    setCurrentDate(function (prev) { return dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1); });
  }

  function progressColor(pct) {
    if (pct >= 70) return "bg-green-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Hisobotlar</h1>
          <p className="text-gray-500 text-sm mt-1">Samaradorligingizni kuzating</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={function () { navMonth(-1); }} className="btn btn-secondary p-2"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <Calendar size={16} className="text-primary-500" />
            <span className="font-bold text-gray-900 dark:text-gray-100 uppercase text-xs tracking-wider">
              {format(currentDate, "MMMM yyyy", { locale: uz })}
            </span>
          </div>
          <button onClick={function () { navMonth(1); }} className="btn btn-secondary p-2"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: "Jami vazifalar", value: taskStats.total, bgClass: "bg-primary-50 dark:bg-primary-900/30", iconClass: "text-primary-600", valueClass: "text-gray-900 dark:text-gray-100" },
          { icon: TrendingUp, label: "Bajarilgan", value: taskStats.completed, bgClass: "bg-green-50 dark:bg-green-900/30", iconClass: "text-green-600", valueClass: "text-green-600" },
          { icon: TrendingDown, label: "Bajarilmagan", value: taskStats.notCompleted, bgClass: "bg-red-50 dark:bg-red-900/30", iconClass: "text-red-600", valueClass: "text-red-600" },
          { icon: Award, label: "Mahsuldorlik", value: taskStats.percentage + "%", bgClass: "bg-amber-50 dark:bg-amber-900/30", iconClass: "text-amber-600", valueClass: "text-amber-600" },
        ].map(function (card, i) {
          var Icon = card.icon;
          return (
            <div key={i} className="card-compact flex items-center gap-4">
              <div className={"p-3 rounded-2xl " + card.bgClass}><Icon className={card.iconClass} size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
                <p className={"text-2xl font-bold " + card.valueClass}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
            Vazifalar hisoboti
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">Umumiy progress</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{taskStats.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div className={"progress-bar h-3 " + progressColor(taskStats.percentage)} style={{ width: taskStats.percentage + "%" }} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Jami vazifalar</span>
                <span className="font-bold">{taskStats.total}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
                <span className="text-sm font-medium text-green-600">Bajarilgan</span>
                <span className="font-bold text-green-600">{taskStats.completed}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                <span className="text-sm font-medium text-red-600">Bajarilmagan</span>
                <span className="font-bold text-red-600">{taskStats.notCompleted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            Odatlar hisoboti
          </h2>
          {habitStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="italic text-sm">Odatlar qo'shilmagan</p>
            </div>
          ) : (
            <div className="space-y-5">
              {habitStats.map(function (h) {
                return (
                  <div key={h.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{h.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 tracking-tighter">{h.completed + " / " + h.total + " kun"}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="progress-bar h-2" style={{ width: h.percentage + "%", backgroundColor: h.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
