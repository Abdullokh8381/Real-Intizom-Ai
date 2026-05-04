import { useState, useMemo, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { 
  Users, 
  Plus, 
  Trophy, 
  X, 
  ArrowLeft, 
  Mail, 
  Check, 
  XCircle, 
  Sword, 
  Calendar, 
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function Competition() {
  const { user } = useAuth();
  const data = useData();
  const [showModal, setShowModal] = useState(false);
  
  // Modal states
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  
  const [isChecking, setIsChecking] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  // Do'stlar natijasini avtomatik yangilab turish (Polling - har 3 soniyada)
  useEffect(() => {
    const interval = setInterval(() => {
      data.loadData();
    }, 3000); 
    return () => clearInterval(interval);
  }, [data.loadData]);

  const pendingRequests = useMemo(() => {
    return (data.competitions || []).filter(c => c.status === 'pending' && String(c.receiver_id) === String(user.id));
  }, [data.competitions, user.id]);

  const activeCompetitions = useMemo(() => {
    return (data.competitions || []).filter(c => c.status === 'active');
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
      await data.searchUserByEmail(email);
      const res = await data.sendCompetitionInvite(email, title, startDate, endDate, note);
      if (res.success) {
        toast.success("Taklif yuborildi!");
        resetModal();
      } else {
        toast.error(res.error || "Xatolik yuz berdi");
      }
    } catch (err) {
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

  return (
    <div className="page-transition space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Musobaqa</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2">
            <Users size={16} className="text-primary-500" />
            Do'stlar bilan natijalarni o'zaro solishtiring
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary shadow-lg shadow-primary-500/30 px-6 py-3 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span>Yangi musobaqa</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="card overflow-hidden border-0 bg-gradient-to-r from-primary-600 to-emerald-600 p-6 text-white shadow-xl relative">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
            <Trophy size={40} className="text-amber-300 drop-shadow-md" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-1">Kim birinchi?</h3>
            <p className="text-primary-50 text-sm opacity-90 max-w-md">
              Odatlarni birgalikda bajaring va do'stingizdan o'zib keting. G'olibning avatari ustida toj paydo bo'ladi!
            </p>
          </div>
        </div>
        <Sparkles className="absolute top-[-10px] right-[-10px] text-white/10 w-40 h-40" />
      </div>

      {/* Pending Invites */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <Mail size={18} className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Yangi takliflar</h2>
            <span className="bg-primary-100 text-primary-700 text-xs font-black px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="card bg-white dark:bg-gray-900 border-primary-100 dark:border-primary-900/30 flex flex-col sm:flex-row items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-2xl shrink-0">
                  👤
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{req.sender_name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{req.title}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleRespond(req.id, 'active')} 
                    className="btn bg-primary-500 hover:bg-primary-600 text-white p-2.5 rounded-xl shadow-sm transition-all"
                    title="Qabul qilish"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => handleRespond(req.id, 'rejected')} 
                    className="btn bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 p-2.5 rounded-xl transition-all"
                    title="Rad etish"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Competitions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Sword size={18} className="text-primary-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Faol bellashuvlar</h2>
        </div>

        {activeCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeCompetitions.map(comp => {
              const isSender = String(comp.sender_id) === String(user.id);
              const myName = "Siz";
              const theirName = isSender ? comp.receiver_name : comp.sender_name;
              
              const myProgress = isSender ? comp.sender_progress : comp.receiver_progress;
              const theirProgress = isSender ? comp.receiver_progress : comp.sender_progress;
              
              const myDoneDays = isSender ? comp.sender_done_count : comp.receiver_done_count;
              const theirDoneDays = isSender ? comp.receiver_done_count : comp.sender_done_count;
              const totalDays = comp.total_days;
              
              const iAmLeader = myProgress >= theirProgress;
              const draw = myProgress === theirProgress && myProgress > 0;

              return (
                <div key={comp.id} className="card p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col group">
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <Trophy size={18} className="text-amber-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{comp.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Calendar size={12} />
                        {comp.start_date}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Clock size={12} />
                        {comp.end_date}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 relative">
                    <div className="grid grid-cols-2 gap-12 relative">
                      {/* VS Divider */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-[10px] font-black text-primary-600 italic">VS</span>
                        </div>
                      </div>

                      {/* Participant 1: Me */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {iAmLeader && !draw && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce drop-shadow-md">👑</div>
                          )}
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl transition-all duration-500 ${iAmLeader ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 ring-4 ring-amber-400/50 shadow-xl shadow-amber-400/20" : "bg-gray-50 dark:bg-gray-800 ring-4 ring-gray-100 dark:ring-gray-700"}`}>
                            👤
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">{myName}</p>
                          <div className="mt-3 space-y-1">
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden min-w-[120px] shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${iAmLeader ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-gradient-to-r from-primary-400 to-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"}`}
                                style={{ width: `${myProgress}%` }}
                              />
                            </div>
                            <p className={`text-xl font-black ${iAmLeader ? "text-amber-600" : "text-primary-600"}`}>{myDoneDays} / {totalDays} kun</p>
                          </div>
                        </div>
                      </div>

                      {/* Participant 2: Them */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {!iAmLeader && !draw && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce drop-shadow-md">👑</div>
                          )}
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl transition-all duration-500 ${!iAmLeader ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 ring-4 ring-amber-400/50 shadow-xl shadow-amber-400/20" : "bg-gray-50 dark:bg-gray-800 ring-4 ring-gray-100 dark:ring-gray-700"}`}>
                            🧑
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide truncate max-w-[100px]">{theirName}</p>
                          <div className="mt-3 space-y-1">
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden min-w-[120px] shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${!iAmLeader ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-gradient-to-r from-primary-400 to-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"}`}
                                style={{ width: `${theirProgress}%` }}
                              />
                            </div>
                            <p className={`text-xl font-black ${!iAmLeader ? "text-amber-600" : "text-primary-600"}`}>{theirDoneDays} / {totalDays} kun</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  {comp.note && (
                    <div className="px-6 py-4 bg-gray-50/30 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-500" />
                        "{comp.note}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-20 border-dashed bg-white/50 dark:bg-gray-900/50">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <Users className="text-gray-300 dark:text-gray-600" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Musobaqalar yo'q</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-8">
              Hali hech qanday bellashuvda qatnashmayapsiz. Do'stlaringizni chaqiring va o'zaro kuch sinashing!
            </p>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn btn-primary px-8 flex items-center gap-2 mx-auto"
            >
              <Plus size={18} /> Do'stni chaqirish
            </button>
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={resetModal} />
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">
            
            {userNotFound ? (
              <div className="p-8">
                <button 
                  onClick={() => setUserNotFound(false)} 
                  className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeft size={18} /> 
                  <span>ORTGA QAYTISH</span>
                </button>
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto ring-8 ring-primary-100 dark:ring-primary-900/10">
                    <Mail className="text-primary-500" size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3">Do'stingiz hali bizda emas</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Afsuski, kiritilgan e-mail bo'yicha foydalanuvchi topilmadi. Unga taklif xati yuboring va "Intizom AI" oilasiga jalb qiling!
                    </p>
                  </div>
                  <a 
                    href={`mailto:${email}?subject=Intizom AI ga taklif&body=Salom! Men seni Intizom AI ilovasida musobaqaga chorlamoqchiman. Ilovadan ro'yxatdan o't: https://real-intizom-ai.vercel.app/`} 
                    className="btn btn-primary w-full py-4 text-lg flex justify-center items-center gap-2 shadow-xl shadow-primary-500/20"
                  >
                    <span>E-MAIL YUBORISH</span>
                    <ChevronRight size={20} />
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-primary-600 p-8 text-white relative">
                  <h3 className="text-2xl font-black mb-1">Yangi bellashuv</h3>
                  <p className="text-primary-100 text-sm opacity-80">Do'stingizni taklif qiling va boshlang!</p>
                  <button onClick={resetModal} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Musobaqa nomi</label>
                      <input 
                        type="text" 
                        className="input bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500 rounded-2xl py-4" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="Masalan: Kitob o'qish" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Boshlanish</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="date" 
                            className="input bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500 rounded-2xl py-4 pl-12" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Tugash</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="date" 
                            className="input bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500 rounded-2xl py-4 pl-12" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">E-mail pochta</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" 
                          className="input bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500 rounded-2xl py-4 pl-12" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          placeholder="do'st@mail.com" 
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Qo'shimcha shartlar</label>
                      <textarea 
                        className="input bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500 rounded-2xl py-4" 
                        rows="2" 
                        value={note} 
                        onChange={e => setNote(e.target.value)} 
                        placeholder="Masalan: Kuniga 20 betdan..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <button 
                      onClick={resetModal} 
                      className="btn bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold px-8 py-4 rounded-2xl flex-1 hover:bg-gray-200 transition-colors"
                    >
                      BEKOR QILISH
                    </button>
                    <button 
                      onClick={handleInviteSubmit} 
                      disabled={isChecking} 
                      className="btn btn-primary font-bold px-8 py-4 rounded-2xl flex-1 shadow-lg shadow-primary-500/20"
                    >
                      {isChecking ? "TEKSHIRILMOQDA..." : "YUBORISH"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
