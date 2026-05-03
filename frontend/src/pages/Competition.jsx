import { useState } from "react";
import { Users, Plus, Trophy, X } from "lucide-react";

export default function Competition() {
  var [showModal, setShowModal] = useState(false);

  var demo = {
    name: "30 kun ertalab turish",
    participants: [
      { name: "Siz", avatar: "\uD83E\uDDD1", progress: 85, isLeader: true },
      { name: "Dostingiz", avatar: "\uD83D\uDC66", progress: 72, isLeader: false },
    ],
    endDate: "2026-06-20",
  };

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Musobaqa</h1>
          <p className="text-gray-500 text-sm mt-1">Dostlar bilan musobaqalashing</p>
        </div>
        <button onClick={function () { setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Yangi musobaqa
        </button>
      </div>

      {/* Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-950/30 dark:to-emerald-950/30 border-primary-200 dark:border-primary-800/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl shrink-0">
            <Trophy className="text-primary-600" size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Dostlar bilan musobaqa!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Kim oldinda ketsa, avatari ustida toj paydo boladi!</p>
          </div>
        </div>
      </div>

      {/* Demo card */}
      <div className="card hover:shadow-xl transition-all">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{demo.name}</h3>
        <div className="grid grid-cols-2 gap-6">
          {demo.participants.map(function (p, i) {
            return (
              <div key={i} className="text-center space-y-3">
                <div className="relative inline-block">
                  {p.isLeader && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">{"\uD83D\uDC51"}</div>}
                  <div className={"w-20 h-20 rounded-full flex items-center justify-center text-4xl " + (p.isLeader ? "bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-400" : "bg-gray-100 dark:bg-gray-800 ring-4 ring-gray-200 dark:ring-gray-700")}>
                    {p.avatar}
                  </div>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className={"progress-bar h-3 " + (p.isLeader ? "bg-amber-500" : "bg-primary-500")} style={{ width: p.progress + "%" }} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{p.progress}%</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 text-center">
          {"Tugash: " + demo.endDate}
        </div>
      </div>

      {/* Empty state */}
      <div className="card text-center py-12 border-dashed">
        <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
        <p className="text-gray-500 text-lg font-medium">Dostingizni taklif qiling</p>
        <p className="text-gray-400 text-sm mt-1">Backend ulangandan keyin toliq ishlaydi</p>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 modal-overlay" onClick={function () { setShowModal(false); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md modal-content border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Yangi musobaqa</h3>
                <button onClick={function () { setShowModal(false); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                  <input type="text" className="input" placeholder="30 kun barvaqt turish" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dostni taklif</label>
                  <input type="email" className="input" placeholder="email@misol.com" />
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
                  Backend kerak. Hozircha demo korinishda.
                </div>
                <div className="flex gap-3">
                  <button onClick={function () { setShowModal(false); }} className="btn btn-secondary flex-1">Bekor</button>
                  <button className="btn btn-primary flex-1 opacity-50 cursor-not-allowed" disabled>Yaratish</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
