import { useState, useMemo, useRef } from "react";
import { useData } from "../context/DataContext";
import { 
  Trash2, 
  Save, 
  Edit3, 
  Search,
  Bold,
  Italic,
  List,
  Type,
  StickyNote,
  X,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css'; // Using bubble theme for a cleaner look

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, loading } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: "", content: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const quillRef = useRef(null);

  function handleSave() {
    if (!currentNote.content || currentNote.content === '<p><br></p>') {
      toast.error("Eslatma bo'sh bo'lishi mumkin emas");
      return;
    }

    if (currentNote.id) {
      updateNote(currentNote.id, currentNote.title, currentNote.content);
      toast.success("Eslatma yangilandi");
    } else {
      addNote(currentNote.title || "Sarlavhasiz", currentNote.content);
      toast.success("Eslatma saqlandi");
    }

    setCurrentNote({ id: null, title: "", content: "" });
    setIsEditing(false);
  }

  function handleDelete(noteId, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-bold text-sm">Eslatmani o'chirib yubormoqchimisiz?</p>
        <div className="flex justify-end gap-2">
          <button 
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Bekor qilish
          </button>
          <button 
            className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-bold shadow-lg shadow-red-600/20 transition-colors"
            onClick={() => {
              deleteNote(noteId);
              toast.dismiss(t.id);
              toast.success("Eslatma o'chirildi");
              if (selectedNote && Number(selectedNote.id) === Number(noteId)) {
                setSelectedNote(null);
              }
            }}
          >
            O'chirish
          </button>
        </div>
      </div>
    ), { duration: 6000, position: 'top-center' });
  }

  function handleEdit(note, e) {
    if (e) e.stopPropagation();
    setCurrentNote({ id: note.id, title: note.title, content: note.content });
    setIsEditing(true);
    setSelectedNote(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredNotes = useMemo(() => {
    return notes.filter(function(n) {
      return (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
             (n.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [notes, searchQuery]);

  // Command handlers for custom buttons
  function applyBold() {
    const editor = quillRef.current.getEditor();
    const format = editor.getFormat();
    editor.format('bold', !format.bold);
  }

  function applyItalic() {
    const editor = quillRef.current.getEditor();
    const format = editor.getFormat();
    editor.format('italic', !format.italic);
  }

  function applyList() {
    const editor = quillRef.current.getEditor();
    const format = editor.getFormat();
    editor.format('list', format.list === 'bullet' ? false : 'bullet');
  }

  function applyHeading() {
    const editor = quillRef.current.getEditor();
    const format = editor.getFormat();
    editor.format('header', format.header === 2 ? false : 2);
  }

  return (
    <div className="page-transition space-y-6">
      <style>{`
        .ql-container {
          font-family: inherit;
          font-size: 1rem;
          border: none !important;
        }
        .ql-editor {
          padding: 0 !important;
          min-height: 150px;
          color: inherit;
        }
        .ql-editor.ql-blank::before {
          left: 0 !important;
          font-style: normal;
          color: #9ca3af;
        }
        .dark .ql-editor.ql-blank::before {
          color: #4b5563;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <StickyNote className="text-primary-600" />
            Eslatmalar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Fikrlaringiz va rejalaringizni bir joyda saqlang
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Eslatmalarni izlash..." 
            value={searchQuery}
            onChange={function(e) { setSearchQuery(e.target.value); }}
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all w-full sm:w-64 text-sm"
          />
        </div>
      </div>

      {/* Editor Card */}
      <div className="card shadow-xl border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="p-4 sm:p-6 space-y-4">
          <input 
            type="text"
            placeholder="Sarlavha (ixtiyoriy)"
            value={currentNote.title}
            onChange={function(e) { 
              const val = e.target.value;
              setCurrentNote(prev => ({ ...prev, title: val })); 
            }}
            className="w-full text-lg font-bold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-900 dark:text-gray-100"
          />
          
          <div className="min-h-[150px]">
            <ReactQuill 
              ref={quillRef}
              theme="bubble"
              placeholder="Eslatma yozing..."
              value={currentNote.content}
              onChange={(val) => setCurrentNote(prev => ({ ...prev, content: val }))}
              modules={{ toolbar: false }} // We use our custom buttons
              className="text-gray-700 dark:text-gray-300"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={applyBold}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors" 
                title="Qalin"
              >
                <Bold size={18} />
              </button>
              <button 
                onClick={applyItalic}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors" 
                title="Kursiv"
              >
                <Italic size={18} />
              </button>
              <button 
                onClick={applyList}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors" 
                title="Ro'yxat"
              >
                <List size={18} />
              </button>
              <button 
                onClick={applyHeading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors" 
                title="Sarlavha"
              >
                <Type size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {(currentNote.content && currentNote.content !== '<p><br></p>' || currentNote.title || isEditing) && (
                <button 
                  onClick={function() { 
                    setCurrentNote({ id: null, title: "", content: "" }); 
                    setIsEditing(false);
                  }}
                  className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Tozalash</span>
                </button>
              )}
              <button 
                onClick={handleSave}
                className="p-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2 text-sm font-bold"
              >
                <Save size={18} />
                <span>{isEditing ? "Yangilash" : "Saqlash"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map(function(_, i) {
            return (
              <div key={i} className="card h-32 animate-pulse bg-gray-50 dark:bg-gray-900 border-none" />
            );
          })
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="bg-gray-100 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <StickyNote size={40} className="text-gray-300 dark:text-gray-700" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">Eslatmalar topilmadi</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yangi eslatma yozishni boshlang!</p>
            </div>
          </div>
        ) : (
          filteredNotes.map(function(note) {
            return (
              <div 
                key={note.id} 
                onClick={() => setSelectedNote(note)}
                className="card group cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-300 border-gray-100 dark:border-gray-800 p-4 flex flex-col h-40"
              >
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm">{note.title}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleEdit(note, e);
                        }}
                        className="p-2 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(note.id, e);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed quill-content pointer-events-none">
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{note.created_at ? format(new Date(note.created_at), "dd.MM.yyyy") : ""}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note Details Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {selectedNote.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <Calendar size={14} />
                    <span>{selectedNote.created_at ? format(new Date(selectedNote.created_at), "dd MMMM, yyyy") : ""}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-500 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed quill-content">
                <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={(e) => handleDelete(selectedNote.id, e)}
                className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2 border-none"
              >
                <Trash2 size={18} />
                <span>O'chirish</span>
              </button>
              <button 
                onClick={(e) => handleEdit(selectedNote, e)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Edit3 size={18} />
                <span>Tahrirlash</span>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedNote(null)} />
        </div>
      )}
      
      <style>{`
        .quill-content h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #111827; }
        .dark .quill-content h2 { color: #f9fafb; }
        .quill-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .quill-content p { margin-bottom: 0.75rem; }
        .quill-content strong { font-weight: 700; color: #111827; }
        .dark .quill-content strong { color: #f9fafb; }
      `}</style>
    </div>
  );
}
