import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Book, Search, Edit3, Trash2, X, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AllBooks = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => (await axiosSecure.get("/books")).data,
  });

  const { mutateAsync: deleteBook, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => (await axiosSecure.delete(`/books/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book deleted!");
      setDeletingId(null);
    },
  });

  const filteredBooks = books.filter((b) =>
    (b.fullCitation || b.title)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1410]/80 p-5 rounded-3xl border border-amber-400/20 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              All Academic Books ({books.length})
            </h1>
            <p className="text-xs text-slate-400 font-mono">Manage published textbooks & reference books.</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-xs font-mono text-emerald-300">Loading books...</div>
      ) : (
        <div className="space-y-3">
          {filteredBooks.map((item, index) => (
            <div
              key={item._id}
              className="bg-[#0a110d] border border-emerald-900/60 p-5 rounded-3xl flex items-start justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-950 border border-emerald-500/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-amber-400 text-xs font-mono font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-emerald-950 border border-amber-400/30 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <Sparkles size={10} /> ACADEMIC PUBLICATION
                    </span>
                    {item.volume && <span className="text-[10px] font-mono text-slate-400">Vol. {item.volume}</span>}
                  </div>

                  <p className="text-xs md:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.fullCitation || `${item.authors} (${item.publicationYear}). ${item.title}. ${item.publisher}.`}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="bg-[#121c17] border border-emerald-500/20 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full">Textbook & Reference</span>
                    <span className="bg-[#121c17] border border-emerald-500/20 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full">Curriculum Aligned</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditingBook(item)} className="p-2 border border-emerald-500/30 bg-emerald-950 text-amber-300 rounded-xl">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => setDeletingId(item._id)} className="p-2 border border-rose-500/30 bg-rose-950 text-rose-300 rounded-xl">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingBook && <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} />}

      {/* DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1410] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-slate-300">Permanently delete this book?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2 bg-[#121c17] text-slate-300 text-xs rounded-xl">Cancel</button>
              <button onClick={() => deleteBook(deletingId)} disabled={isDeleting} className="flex-1 py-2 bg-rose-600 text-white text-xs rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditBookModal = ({ book, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: book });

  const { mutateAsync: updateBook, isPending } = useMutation({
    mutationFn: async (data) => (await axiosSecure.patch(`/books/${book._id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Updated!");
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0d1410] rounded-3xl max-w-lg w-full border border-amber-400/30 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-emerald-900/40 pb-3">
          <h3 className="text-sm font-bold text-white">Edit Book</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit((d) => updateBook(d))} className="space-y-3">
          <input {...register("title")} placeholder="Title" className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
          <input {...register("authors")} placeholder="Authors" className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
          <input {...register("publisher")} placeholder="Publisher" className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
          <div className="grid grid-cols-2 gap-2">
            <input {...register("publicationYear")} placeholder="Year" className="px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
            <input {...register("volume")} placeholder="Volume" className="px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#121c17] text-slate-300 text-xs rounded-xl">Cancel</button>
            <button type="submit" disabled={isPending} className="px-5 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllBooks;