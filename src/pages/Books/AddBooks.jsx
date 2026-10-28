import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Book, PlusCircle, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AddBooks = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: createBook } = useMutation({
    mutationFn: async (data) => (await axiosSecure.post("/books", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book added successfully! 📚");
      reset();
      setIsSaving(false);
      navigate("/books/all");
    },
    onError: (err) => {
      setIsSaving(false);
      toast.error(err.response?.data?.message || "Failed to add book.");
    },
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    const fullCitation = `${data.authors} (${data.publicationYear}). ${data.title}${data.edition ? ` (${data.edition})` : ''}. ${data.location ? `${data.location}: ` : ''}${data.publisher}.`;
    await createBook({ ...data, fullCitation });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100 font-sans">
      <div className="flex items-center gap-3 bg-[#0d1410]/80 p-5 rounded-3xl border border-amber-400/20 shadow-2xl">
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400">
          <Book className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            Add New Book <Sparkles size={14} className="text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 font-mono">Publish academic textbooks or reference materials.</p>
        </div>
      </div>

      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Book Title *</label>
            <input
              type="text"
              placeholder="e.g. Financial Statement Analysis"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
              {...register("title", { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Authors *</label>
              <input
                type="text"
                placeholder="e.g. Bishawas, D. K., Faruk, M. O."
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("authors", { required: true })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Publisher *</label>
              <input
                type="text"
                placeholder="e.g. Millenium Publications"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("publisher", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Year *</label>
              <input
                type="text"
                defaultValue={new Date().getFullYear()}
                className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("publicationYear", { required: true })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Edition</label>
              <input
                type="text"
                placeholder="e.g. 5th ed."
                className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("edition")}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Volume</label>
              <input
                type="text"
                placeholder="e.g. 4"
                className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("volume")}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                defaultValue="Dhaka"
                className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("location")}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl hover:from-amber-300 transition text-xs uppercase flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Publish Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBooks;