import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Award,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Sparkles,
  Monitor,
  Binary,
  Brain,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AllExpertise = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingExpertise, setEditingExpertise] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // GET All Expertises
  const { data: expertises = [], isLoading, isError, error } = useQuery({
    queryKey: ["expertises"],
    queryFn: async () => {
      const res = await axiosSecure.get("/expertises");
      return res.data;
    },
  });

  // DELETE Mutation
  const { mutateAsync: deleteExpertise, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/expertises/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expertises"] });
      toast.success("Expertise record deleted! 🗑️");
      setDeletingId(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete expertise.");
    },
  });

  // Filter Search Logic
  const filteredExpertises = expertises.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = item.skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return titleMatch || catMatch || skillMatch;
  });

  // Render Icon according to iconType
  const renderCardIcon = (iconType) => {
    if (iconType === "binary") {
      return (
        <div className="w-11 h-11 bg-[#121c17] rounded-2xl border border-emerald-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[11px] font-extrabold leading-none">
          01<br />10
        </div>
      );
    }
    if (iconType === "brain") {
      return (
        <div className="w-11 h-11 bg-[#121c17] rounded-2xl border border-emerald-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Brain className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 bg-[#121c17] rounded-2xl border border-emerald-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <Monitor className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">All Expertise</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                {expertises.length} Cards
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage your technical skillsets, research domains, and academic strengths.
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search domain, skills, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
          />
        </div>
      </div>

      {/* CONTENT GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1410]/80 rounded-3xl border border-amber-400/20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono text-emerald-300">Loading expertise domains...</span>
        </div>
      ) : isError ? (
        <div className="bg-rose-950/40 border border-rose-500/30 p-6 rounded-3xl text-center text-rose-300">
          <p className="font-extrabold text-sm">Failed to load expertises!</p>
          <p className="text-xs text-rose-400 font-mono mt-1">{error?.message}</p>
        </div>
      ) : filteredExpertises.length === 0 ? (
        <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <Award className="w-12 h-12 mx-auto text-emerald-500/40" />
          <p className="text-base font-extrabold text-white">No Expertise Cards Found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or create a new expertise domain.</p>
        </div>
      ) : (
        /* GRID MATCHING THE EXACT SCREENSHOT LOOK */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpertises.map((item) => (
            <div
              key={item._id}
              className="bg-[#0a110d]/90 border border-emerald-900/60 p-6 rounded-3xl shadow-2xl backdrop-blur-xl hover:border-amber-400/40 transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Header: Icon & Category Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  {renderCardIcon(item.iconType)}
                  <span className="bg-[#121c17] border border-emerald-500/30 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed min-h-[50px] mb-6">
                  {item.description}
                </p>

                {/* Divider Line */}
                <div className="border-t border-emerald-900/40 my-4"></div>

                {/* Skills Pills / Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121c17] border border-emerald-500/30 text-slate-200 text-xs font-bold rounded-full"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-emerald-900/40">
                <button
                  onClick={() => setEditingExpertise(item)}
                  className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-900/80 text-amber-300 transition cursor-pointer"
                  title="Edit Expertise"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(item._id)}
                  className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition cursor-pointer"
                  title="Delete Expertise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- EDIT EXPERTISE MODAL --- */}
      {editingExpertise && (
        <EditExpertiseModal
          expertise={editingExpertise}
          onClose={() => setEditingExpertise(null)}
        />
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-[#090e0b]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0d1410] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-950/80 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Delete Expertise?</h3>
              <p className="text-xs text-slate-400 font-medium">
                This expertise card will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-[#121c17] border border-emerald-500/30 hover:bg-emerald-950/60 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => deleteExpertise(deletingId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-70 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* ==================================================================== */
/*                  EDIT EXPERTISE MODAL COMPONENT                      */
/* ==================================================================== */
const EditExpertiseModal = ({ expertise, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [skills, setSkills] = useState(expertise.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: expertise.title || "",
      category: expertise.category || "",
      iconType: expertise.iconType || "monitor",
      description: expertise.description || "",
    },
  });

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // PATCH Mutation
  const { mutateAsync: updateExpertise } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.patch(`/expertises/${expertise._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expertises"] });
      toast.success("Expertise updated successfully! 📝");
      setTimeout(() => {
        setIsUpdating(false);
        onClose();
      }, 800);
    },
    onError: (err) => {
      console.error("Update Error:", err);
      setIsUpdating(false);
      toast.error(err.response?.data?.message || "Failed to update expertise.");
    },
  });

  const onSubmit = async (data) => {
    if (skills.length === 0) {
      return toast.error("Please add at least one skill tag!");
    }

    try {
      setIsUpdating(true);
      const payload = {
        title: data.title,
        category: data.category,
        iconType: data.iconType,
        description: data.description,
        skills: skills,
      };

      await updateExpertise(payload);
    } catch (err) {
      console.error(err);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090e0b]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      
      <div className="bg-[#0d1410] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-400/30 overflow-hidden relative my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#121c17]/80 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/30 text-amber-400 rounded-2xl shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Edit Expertise Card
              </h2>
              <p className="text-xs text-slate-400 font-medium">Update domain details, icon, and skills pills.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category Badge *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-amber-400/60"
                {...register("category", { required: "Category is required" })}
              />
              {errors.category && <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>}
            </div>

            {/* Icon Select */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Card Icon Style</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "monitor", label: "Monitor" },
                  { id: "binary", label: "Binary (01/10)" },
                  { id: "brain", label: "Brain" },
                ].map((iconOption) => (
                  <label
                    key={iconOption.id}
                    className="flex items-center gap-2 p-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={iconOption.id}
                      className="accent-amber-400"
                      {...register("iconType")}
                    />
                    <span className="text-xs font-semibold text-slate-200">{iconOption.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Skills Pills Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Skills Pills *</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill(e)}
                placeholder="Type a skill and press Enter"
                className="flex-1 px-4 py-2 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-emerald-950 border border-emerald-500/30 text-amber-300 text-xs font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-2.5 bg-[#121c17]/60 rounded-xl border border-emerald-500/10 min-h-[45px]">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121c17] border border-emerald-500/30 text-emerald-300 text-xs rounded-full font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-400 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
            <textarea
              rows="3"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60 resize-none"
              {...register("description", { required: "Description is required" })}
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-emerald-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#121c17] border border-emerald-500/30 text-slate-300 text-xs font-bold rounded-xl hover:bg-emerald-950/40 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-70 hover:from-amber-300 hover:to-amber-400"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : "Save Changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AllExpertise;