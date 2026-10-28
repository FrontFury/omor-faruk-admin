import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, PlusCircle, Loader2, Sparkles, Building2, Tag, Layers, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AddActivities = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  const [tags, setTags] = useState(["Faculty Services", "CV Verified"]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      role: "",
      institution: "",
      categoryBadge: "ACADEMIC ROLE",
      appointmentType: "External Appointment",
    }
  });

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const { mutateAsync: createActivity } = useMutation({
    mutationFn: async (data) => (await axiosSecure.post("/activities", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Activity added successfully! 🌟");
      reset();
      setIsSaving(false);
      navigate("/activities/all");
    },
    onError: (err) => {
      setIsSaving(false);
      toast.error(err.response?.data?.message || "Failed to add activity.");
    },
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    await createActivity({ ...data, tags });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100 font-sans">
      <div className="flex items-center gap-3 bg-[#0d1410]/80 p-5 rounded-3xl border border-amber-400/20 shadow-2xl">
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            Add New Activity / Role <Sparkles size={14} className="text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 font-mono">Add academic roles, visiting faculties, or voluntary engagements.</p>
        </div>
      </div>

      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Role / Position *</label>
            <input
              type="text"
              placeholder="e.g. Visiting Faculty, Accounting and Information Systems"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
              {...register("role", { required: true })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Building2 size={13} className="text-amber-400" /> Organization / Institution *
            </label>
            <input
              type="text"
              placeholder="e.g. BBA Program, Department of Business Administration, DCCI Business Institute"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
              {...register("institution", { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Tag size={13} className="text-amber-400" /> Category Badge
              </label>
              <input
                type="text"
                defaultValue="ACADEMIC ROLE"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-amber-400/60"
                {...register("categoryBadge")}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Layers size={13} className="text-amber-400" /> Appointment Type
              </label>
              <input
                type="text"
                defaultValue="External Appointment"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("appointmentType")}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Badges / Pills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag(e)}
                placeholder="Type badge name and press Enter"
                className="flex-1 px-4 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-emerald-950 border border-emerald-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-2.5 bg-[#121c17]/60 rounded-xl border border-emerald-500/10 min-h-[40px]">
              {tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121c17] border border-emerald-500/30 text-emerald-300 text-xs rounded-full font-semibold">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-rose-400 ml-1">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl hover:from-amber-300 transition text-xs uppercase flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Publish Activity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivities;