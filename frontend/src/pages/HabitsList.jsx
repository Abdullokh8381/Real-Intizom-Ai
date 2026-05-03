import { useState } from "react";
import { useData } from "../context/DataContext";
import { ListChecks, Plus, Trash2, Edit2, X, Check } from "lucide-react";

function priorityLevel(p) {
  if (p <= 3) return "low";
  if (p <= 6) return "mid";
  return "high";
}

var PRIORITY_STYLES = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  mid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function HabitsList() {
  var data = useData();
  var [showModal, setShowModal] = useState(false);
  var [editing, setEditing] = useState(null);
  var [formName, setFormName] = useState("");
  var [formColor, setFormColor] = useState("#22c55e");
  var [formPriority, setFormPriority] = useState(5);
  var [formGoalDays, setFormGoalDays] = useState("");

  function resetForm() {
    setFormName("");
    setFormColor("#22c55e");
    setFormPriority(5);
    setFormGoalDays("");
    setEditing(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formName.trim()) return;
    var habitData = {
      name: formName.trim(),
      color: formColor,
      priority: Number(formPriority),
      goalDays: formGoalDays ? Number(formGoalDays) : null,
    };
    if (editing) {
      data.updateHabit(editing.id, habitData);
    } else {
      data.addHabit(habitData);
    }
    setShowModal(false);
    resetForm();
  }

  var sorted = data.habits.slice().sort(function (a, b) { return b.priority - a.priority; });

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Odatlar</h1>
          <p className="text-gray-500 text-sm mt-1">Barcha odatlaringizni boshqaring</p>
        </div>
        <button onClick={function() { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Yangi odat
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Odat nomi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Prioritet</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Maqsad</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sorted.map(function (habit) {
                var level = priorityLevel(habit.priority);
                return (
                  <tr key={habit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-black/5 shadow-sm" style={{ backgroundColor: habit.color }} />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{habit.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider " + PRIORITY_STYLES[level]}>
                        {level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {habit.goalDays ? habit.goalDays + " kun" : "Cheksiz"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={function() { 
                            setFormName(habit.name); 
                            setFormColor(habit.color); 
                            setFormPriority(habit.priority); 
                            setFormGoalDays(habit.goalDays || ""); 
                            setEditing(habit); 
                            setShowModal(true); 
                          }} 
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button onClick={function() { if(confirm('Ochirishni tasdiqlaysizmi?')) data.deleteHabit(habit.id); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ListChecks size={40} className="text-gray-200" />
                      <p className="text-gray-400 italic text-sm">Hali odatlar qo'shilmagan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editing ? "Odatni tahrirlash" : "Yangi odat qo'shish"}
              </h2>
              <button onClick={function() { setShowModal(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Odat nomi</label>
                <input type="text" value={formName} onChange={function(e) { setFormName(e.target.value); }} className="input" placeholder="Masalan: Kitob o'qish" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Rang</label>
                  <input type="color" value={formColor} onChange={function(e) { setFormColor(e.target.value); }} className="w-full h-11 rounded-xl cursor-pointer border-2 border-gray-100 dark:border-gray-800 p-1 bg-white dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Prioritet (1-10)</label>
                  <input type="number" min="1" max="10" value={formPriority} onChange={function(e) { setFormPriority(e.target.value); }} className="input" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Maqsad (jami kunlar)</label>
                <input type="number" value={formGoalDays} onChange={function(e) { setFormGoalDays(e.target.value); }} className="input" placeholder="Masalan: 30" />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">* Bo'sh qoldirilsa cheksiz davom etadi</p>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={function() { setShowModal(false); }} className="btn btn-secondary flex-1">Bekor qilish</button>
                <button type="submit" className="btn btn-primary flex-1">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
