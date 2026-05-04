import { useState } from "react";
import { useData } from "../context/DataContext";
import { differenceInDays } from "date-fns";
import { Trophy, Plus, Play, X, Check, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

var PRESETS = [
  { name: "30 kun shakarsiz", desc: "Bir oy shakar yoq", days: 30, qty: "0 gr shakar", emoji: "\uD83C\uDF6C" },
  { name: "30 kun barvaqt turish", desc: "Har kuni 06:00 da turish", days: 30, qty: "06:00", emoji: "\u23F0" },
  { name: "30 kun 10000 qadam", desc: "Har kuni 10000 qadam", days: 30, qty: "10,000 qadam", emoji: "\uD83D\uDEB6" },
  { name: "21 kun kitob oqish", desc: "Har kuni 30 daqiqa kitob", days: 21, qty: "30 daqiqa", emoji: "\uD83D\uDCDA" },
  { name: "14 kun meditatsiya", desc: "Har kuni 10 daqiqa", days: 14, qty: "10 daqiqa", emoji: "\uD83E\uDDD8" },
];

export default function Challenges() {
  var data = useData();
  var [showModal, setShowModal] = useState(false);
  var [detail, setDetail] = useState(null);
  var [formName, setFormName] = useState("");
  var [formDesc, setFormDesc] = useState("");
  var [formDays, setFormDays] = useState(30);
  var [formQty, setFormQty] = useState("");

  function openPreset(preset) {
    setFormName(preset.name);
    setFormDesc(preset.desc);
    setFormDays(preset.days);
    setFormQty(preset.qty);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Nomi bo'sh bo'lmasligi kerak");
      return;
    }
    
    try {
      await data.addChallenge({ 
        name: formName.trim(), 
        description: formDesc, 
        durationDays: Number(formDays), 
        quantityLabel: formQty 
      });
      toast.success("Chellenj muvaffaqiyatli qo'shildi!");
      setShowModal(false);
      setFormName(""); setFormDesc(""); setFormDays(30); setFormQty("");
    } catch (err) {
      toast.error("Xatolik yuz berdi");
      console.error(err);
    }
  }

  function statusBadge(status) {
    if (status === "active") return { cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", txt: "Faol" };
    if (status === "completed") return { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", txt: "Tugagan" };
    return { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", txt: "Boshlanmagan" };
  }

  function daysInfo(ch) {
    if (ch.status !== "active") return null;
    var start = new Date(ch.startDate);
    var end = new Date(ch.endDate);
    var today = new Date();
    return { passed: differenceInDays(today, start) + 1, left: Math.max(0, differenceInDays(end, today)) };
  }

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Chellenjlar</h1>
          <p className="text-gray-500 text-sm mt-1">Ozingizga qiyinchilik yarating</p>
        </div>
        <button onClick={function () { setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Yangi chellenj
        </button>
      </div>

      {data.challenges.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 text-lg font-medium">Hali chellenj yoq</p>
          <p className="text-gray-400 text-sm mt-1">Yangi chellenj yarating yoki shablonlardan tanlang</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.challenges.map(function (ch) {
            var progress = data.getChallengeProgress(ch.id);
            var badge = statusBadge(ch.status);
            var info = daysInfo(ch);
            return (
              <div key={ch.id} onClick={function () { setDetail(ch); }} className="card cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className={"inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold " + badge.cls}>{badge.txt}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 pr-24 mb-1">{ch.name}</h3>
                {ch.quantityLabel && <p className="text-sm text-primary-600 font-medium">{ch.quantityLabel}</p>}
                {ch.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ch.description}</p>}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{progress.completed + "/" + progress.total + " kun"}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="progress-bar h-2.5 bg-green-500" style={{ width: progress.percentage + "%" }} />
                  </div>
                  {info && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{info.passed + " kun otdi"}</span>
                      <span>{info.left + " kun qoldi"}</span>
                    </div>
                  )}
                </div>
                {ch.status === "not_started" && (
                  <button
                    onClick={function (e) { e.stopPropagation(); data.startChallenge(ch.id); }}
                    className="mt-3 btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Play size={16} /> Boshlash
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Presets */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Tavsiya etilgan chellenjlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map(function (p, i) {
            return (
              <button key={i} onClick={function () { openPreset(p); }} className="card-compact flex items-center gap-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.days + " kun"}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      {detail && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 modal-overlay" onClick={function () { setDetail(null); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg modal-content border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detail.name}</h3>
                  {detail.quantityLabel && <p className="text-sm text-primary-600 font-medium">{detail.quantityLabel}</p>}
                </div>
                <button onClick={function () { setDetail(null); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              {detail.description && <p className="text-gray-600 dark:text-gray-400 mb-4">{detail.description}</p>}
              {(function () {
                var prog = data.getChallengeProgress(detail.id);
                var info = daysInfo(detail);
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{prog.completed}</p>
                        <p className="text-xs text-green-600/70">Bajarildi</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{info ? info.passed - prog.completed : 0}</p>
                        <p className="text-xs text-red-600/70">Otkazildi</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{info ? info.left : detail.durationDays}</p>
                        <p className="text-xs text-blue-600/70">Kun qoldi</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="progress-bar h-3 bg-green-500" style={{ width: prog.percentage + "%" }} />
                    </div>
                  </div>
                );
              })()}
              <div className="flex gap-3 mt-6">
                {detail.status === "not_started" && (
                  <button onClick={function () { data.startChallenge(detail.id); setDetail(null); }} className="btn btn-primary flex-1">Boshlash</button>
                )}
                <button onClick={function () { data.deleteChallenge(detail.id); setDetail(null); }} className="btn btn-danger">Ochirish</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 modal-overlay" onClick={function () { setShowModal(false); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md modal-content border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Yangi chellenj</h3>
                <button onClick={function () { setShowModal(false); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                  <input type="text" value={formName} onChange={function (e) { setFormName(e.target.value); }} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
                  <textarea value={formDesc} onChange={function (e) { setFormDesc(e.target.value); }} className="input min-h-[80px] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Necha kun</label>
                    <input type="number" value={formDays} onChange={function (e) { setFormDays(e.target.value); }} className="input" min="1" max="365" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miqdor</label>
                    <input type="text" value={formQty} onChange={function (e) { setFormQty(e.target.value); }} className="input" placeholder="10,000 qadam" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={function () { setShowModal(false); }} className="btn btn-secondary flex-1">Bekor</button>
                  <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2"><Check size={18} /> Qoshish</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
