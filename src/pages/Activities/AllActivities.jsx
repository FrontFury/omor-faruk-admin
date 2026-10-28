import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Activity, Search, Edit3, Trash2, X, Loader2, Sparkles, AlertTriangle, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AllActivities = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => (await axiosSecure.get("/activities")).data,
  });

  const { mutateAsync: deleteActivity, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => (await axiosSecure.delete(`/activities/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Activity deleted!");
      setDeletingId(null);
    },
  });

  const filteredActivities = activities.filter((a) =>
    a.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1410]/80 p-5 rounded-3xl border border-amber-400/20 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              All Academic Activities ({activities.length})
            </h1>
            <p className="text-xs text-slate-400 font-mono">Manage external appointments and voluntary work.</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role or institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-xs font-mono text-emerald-300">Loading activities...</div>
      ) : (
        /* SCREENSHOT MATCHING GRID CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((item) => (
            <div
              key={item._id}
              className="bg-[#0a110d] border border-emerald-900/60 p-5 rounded-3xl shadow-xl flex flex-col justify-between group relative hover:border-amber-400/40 transition-all"
            >
              <div className="space-y-3">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-emerald-950 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Sparkles size={10} /> {item.categoryBadge || "ACADEMIC ROLE"}
                  </span>
                  <span className="bg-[#121c17] border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                    {item.appointmentType || "External Appointment"}
                  </span>
                </div>

                {/* Role Title */}
                <h3 className="text-sm md:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {item.role}
                </h3>

                {/* Institution */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Building2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{item.institution}</span>
                </div>

                {/* Badges / Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-900/40">
                  {item.tags && item.tags.length > 0 ? (
                    item.tags.map((tag, idx) => (
                      <span key={idx} className="bg-[#121c17] border border-emerald-500/20 text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="bg-[#121c17] border border-emerald-500/20 text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Faculty Services</span>
                      <span className="bg-[#121c17] border border-emerald-500/20 text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">CV Verified</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-emerald-900/40">
                <button onClick={() => setEditingActivity(item)} className="p-2 border border-emerald-500/30 bg-emerald-950 text-amber-300 rounded-xl cursor-pointer">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => setDeletingId(item._id)} className="p-2 border border-rose-500/30 bg-rose-950 text-rose-300 rounded-xl cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingActivity && <EditActivityModal activity={editingActivity} onClose={() => setEditingActivity(null)} />}

      {/* DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1410] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-slate-300">Permanently delete this activity record?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2 bg-[#121c17] text-slate-300 text-xs rounded-xl">Cancel</button>
              <button onClick={() => deleteActivity(deletingId)} disabled={isDeleting} className="flex-1 py-2 bg-rose-600 text-white text-xs rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditActivityModal = ({ activity, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: activity });

  const { mutateAsync: updateActivity, isPending } = useMutation({
    mutationFn: async (data) => (await axiosSecure.patch(`/activities/${activity._id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Updated!");
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0d1410] rounded-3xl max-w-lg w-full border border-amber-400/30 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-emerald-900/40 pb-3">
          <h3 className="text-sm font-bold text-white">Edit Activity Role</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit((d) => updateActivity(d))} className="space-y-3">
          <input {...register("role")} placeholder="Role" className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
          <input {...register("institution")} placeholder="Institution" className="w-full px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
          <div className="grid grid-cols-2 gap-2">
            <input {...register("categoryBadge")} placeholder="Badge" className="px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white uppercase" />
            <input {...register("appointmentType")} placeholder="Type" className="px-3 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white" />
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

export default AllActivities;