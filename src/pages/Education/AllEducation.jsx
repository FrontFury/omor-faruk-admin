import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hook/useAxiosSecure";
import { 
  GraduationCap, 
  Trash2, 
  Edit3, 
  Search, 
  Loader2, 
  Building2, 
  Calendar, 
  Award, 
  Sparkles, 
  X, 
  CheckCircle2 
} from "lucide-react";
import toast from "react-hot-toast";

const AllEducation = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // 1. READ: Fetch all academic records from /academics
  const { data: academics = [], isLoading, isError } = useQuery({
    queryKey: ["academics"],
    queryFn: async () => {
      const res = await axiosSecure.get("/academics");
      return res.data;
    },
  });

  // 2. DELETE MUTATION: DELETE /academics/:id
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/academics/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["academics"]);
      toast.success(data?.message || "Academic record deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete record");
    },
  });

  // 3. UPDATE MUTATION: PATCH /academics/:id
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosSecure.patch(`/academics/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["academics"]);
      toast.success(data?.message || "Academic record updated successfully!");
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update record");
    },
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: editingItem.title,
      degree: editingItem.degree,
      institution: editingItem.institution,
      passingYear: editingItem.passingYear,
      score: editingItem.score,
      description: editingItem.description,
      tags: typeof editingItem.tags === "string" 
        ? editingItem.tags.split(",").map((t) => t.trim()) 
        : editingItem.tags,
    };
    updateMutation.mutate({ id: editingItem._id, payload });
  };

  // Search Filter
  const filteredAcademics = academics.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.degree?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">All Academic Backgrounds</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                {academics.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage, edit, or remove recorded degree qualifications.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by degree or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-400 bg-[#0d1410]/80 rounded-3xl border border-amber-400/20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono text-emerald-300">Loading academic records...</span>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-rose-400 text-xs font-mono bg-[#0d1410]/80 rounded-3xl border border-rose-500/20">
          Failed to load academic records from server.
        </div>
      ) : filteredAcademics.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono bg-[#0d1410]/80 rounded-3xl border border-amber-400/20">
          No academic records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {filteredAcademics.map((item) => (
            <div
              key={item._id}
              className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-[#0d1410]/80 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4 group hover:border-amber-400/40 transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Top Badge Meta */}
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                  <span className="text-xs font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} className="text-amber-400" />
                    {item.passingYear || "N/A"}
                  </span>
                  {item.score && (
                    <span className="text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 rounded-full shadow-md">
                      {item.score}
                    </span>
                  )}
                </div>

                {/* Title & Institution */}
                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  {item.degree && (
                    <p className="text-xs font-bold text-amber-400 mt-1">
                      {item.degree}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 font-medium mt-1.5 flex items-center gap-2">
                    <Building2 size={14} className="text-emerald-400 shrink-0" />
                    {item.institution}
                  </p>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-xs leading-relaxed text-slate-300 bg-[#121c17]/60 p-3.5 rounded-2xl border border-emerald-500/20">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Tags & Action Buttons */}
              <div className="pt-3 border-t border-emerald-900/40 space-y-3">
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-emerald-950/80 text-slate-200 border border-emerald-500/30 px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-900/80 text-amber-300 transition-all cursor-pointer"
                    title="Edit Record"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090e0b]/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0d1410] border border-amber-400/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-amber-400" />
                Edit Academic Record
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl border border-emerald-500/30 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Degree Title</label>
                  <input
                    type="text"
                    value={editingItem.title || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    required
                    className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Major / Concentration</label>
                  <input
                    type="text"
                    value={editingItem.degree || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                    className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Institution</label>
                  <input
                    type="text"
                    value={editingItem.institution || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    required
                    className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Passing Year / Duration</label>
                  <input
                    type="text"
                    value={editingItem.passingYear || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, passingYear: e.target.value })}
                    required
                    className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Score / CGPA</label>
                  <input
                    type="text"
                    value={editingItem.score || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, score: e.target.value })}
                    className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : editingItem.tags || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                    className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-[#121c17] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-emerald-500/30 text-slate-300 text-xs font-bold hover:bg-emerald-950/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 rounded-xl text-xs uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEducation;