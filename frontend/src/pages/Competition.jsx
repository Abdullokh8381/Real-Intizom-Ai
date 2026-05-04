import { useState, useMemo, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Users, Plus, Trophy, X, ArrowLeft, Mail, Check, XCircle } from "lucide-react";

export default function Competition() {
  const { user } = useAuth();
  const data = useData();
  const [showModal, setShowModal] = useState(false);

  // Do'stlar natijasini avtomatik yangilab turish (Polling)
  useEffect(() => {
    const interval = setInterval(() => {
      data.loadData();
    }, 10000); // Har 10 soniyada yangilaydi
    return () => clearInterval(interval);
  }, [data]);
  
  // Modal states
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  
  const [isChecking, setIsChecking] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const pendingRequests = useMemo(() => {
    return data.competitions.filter(c => c.status === 'pending' && String(c.receiver_id) === String(user.id));
  }, [data.competitions, user.id]);

  const activeCompetitions = useMemo(() => {
    return data.competitions.filter(c => c.status === 'active');
  }, [data.competitions]);

  const resetModal = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setNote("");
    setEmail("");
    setUserNotFound(false);
    setIsChecking(false);
    setShowModal(false);
  };

  const handleInviteSubmit = async () => {
    if (!title || !startDate || !endDate || !email) {
      toast.error("Iltimos barcha qatorlarni to'ldiring");
      return;
    }

    setIsChecking(true);
    try {
      const foundUser = await data.searchUserByEmail(email);
      // User found, send invite
      const res = await data.sendCompetitionInvite(email, title, startDate, endDate, note);
      if (res.success) {
        toast.success("Taklif yuborildi!");
        resetModal();
      } else {
        toast.error(res.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      // User not found
      setUserNotFound(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRespond = async (compId, status) => {
    const res = await data.respondToCompetition(compId, status);
    if (res.success) {
      toast.success(status === 'active' ? "Musobaqa boshlandi!" : "Taklif rad etildi");
    } else {
      toast.error(res.error || "Xatolik yuz berdi");
    }
  };

  const getCompProgress = (compId, habitId) => {
    // A simple progress calculation: how many times it was done since start date
    // For a real app, this would be computed by backend or more accurately over the date range.
    // For now we use the weekly progress function as a proxy, or just 0 for new ones.
    const weekStart = data.getWeekStart();
    const prog = data.getHabitWeekProgress(habitId, weekStart);
    return prog.percentage || 0;
  };

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Musobaqa</h1>
          <p className="text-gray-500 text-sm mt-1">Do'stlar bilan musobaqalashing</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Yangi musobaqa
        </button>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Yangi takliflar</h2>
          <div className="grid gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="card flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <div>
                  <h3 className="font-bold text-primary-900 dark:text-primary-100">{req.sender_name} sizni bellashuvga chaqiryapti!</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">Musobaqa: {req.title}</p>
                  {req.note && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 italic">Izoh: {req.note}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(req.id, 'active')} className="btn btn-primary p-2"><Check size={18} /></button>
                  <button onClick={() => handleRespond(req.id, 'rejected')} className="btn btn-secondary text-red-500 p-2"><XCircle size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeCompetitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCompetitions.map(comp => {
            const isSender = String(comp.sender_id) === String(user.id);
            const myHabitId = isSender ? comp.sender_habit_id : comp.receiver_habit_id;
            const theirHabitId = isSender ? comp.receiver_habit_id : comp.sender_habit_id;
            
            const myName = "Siz";
            const theirName = isSender ? comp.receiver_name : comp.sender_name;
            
            const myProgress = isSender ? comp.sender_progress : comp.receiver_progress;
            const theirProgress = isSender ? comp.receiver_progress : comp.sender_progress;
            
            const iAmLeader = myProgress >= theirProgress;

            return (
              <div key={comp.id} className="card hover:shadow-xl transition-all">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{comp.title}</h3>
                <div className="grid grid-cols-2 gap-6">
                  
                  <div className="text-center space-y-3">
                    <div className="relative inline-block">
                      {iAmLeader && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${iAmLeader ? "bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-400" : "bg-gray-100 dark:bg-gray-800 ring-4 ring-gray-200 dark:ring-gray-700"}`}>
                        👤
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{myName}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className={`progress-bar h-3 ${iAmLeader ? "bg-amber-500" : "bg-primary-500"}`} style={{ width: `${myProgress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{myProgress}%</p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="relative inline-block">
                      {!iAmLeader && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${!iAmLeader ? "bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-400" : "bg-gray-100 dark:bg-gray-800 ring-4 ring-gray-200 dark:ring-gray-700"}`}>
                        🧑
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{theirName}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className={`progress-bar h-3 ${!iAmLeader ? "bg-amber-500" : "bg-primary-500"}`} style={{ width: `${theirProgress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{theirProgress}%</p>
                  </div>

                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 text-center">
                  Tugash: {comp.end_date}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12 border-dashed">
          <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 text-lg font-medium">Do'stingizni taklif qiling</p>
          <p className="text-gray-400 text-sm mt-1">Birgalikda odatlarni shakllantirish qiziqarliroq</p>
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={resetModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              
              {userNotFound ? (
                <>
                  <div className="p-6">
                    <button onClick={() => setUserNotFound(false)} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <ArrowLeft size={16} /> Ortga
                    </button>
                    <div className="text-center py-6">
                      <Mail className="mx-auto text-primary-500 mb-4" size={48} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Afsuski do'stingiz hali Intizom Ai oilasi a'zosi emas</h3>
                      <p className="text-sm text-gray-500 mb-6">Do'stingizni taklif qilish uchun unga e-mail xabar yuboring</p>
                      <a href={`mailto:${email}?subject=Intizom AI ga taklif&body=Salom! Men seni Intizom AI ilovasida musobaqaga chorlamoqchiman. Ilovadan ro'yxatdan o't: https://real-intizom-ai.vercel.app/`} className="btn btn-primary w-full flex justify-center items-center gap-2">
                        Taklif yuborish
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Do'stni taklif qilish</h3>
                    <button onClick={resetModal} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Musobaqa turi (Odat nomi)</label>
                      <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Masalan: Har kuni kitob o'qish" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boshlanish</label>
                        <input type="date" className="input text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tugash</label>
                        <input type="date" className="input text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh (qo'shimcha shartlar)</label>
                      <textarea className="input" rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="Kuniga kamida 10 bet..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Do'stingizning e-maili</label>
                      <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@misol.com" />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button onClick={resetModal} className="btn btn-secondary flex-1">Bekor qilish</button>
                      <button onClick={handleInviteSubmit} disabled={isChecking} className="btn btn-primary flex-1">
                        {isChecking ? "Tekshirilmoqda..." : "Taklif yuborish"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
