import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Award,
  Tag,
  PlusCircle,
  X,
  Loader2,
  CheckCircle2,
  Database,
  FileText,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AddExpertise = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      category: "",
      iconType: "monitor",
      description: "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  // Add skill tag
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // TanStack Query Mutation
  const { mutateAsync: createExpertise } = useMutation({
    mutationFn: async (newExpertise) => {
      const res = await axiosSecure.post("/expertises", newExpertise);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expertises"] });
      toast.success("Expertise added successfully! 🌟");
      setTimeout(() => {
        reset();
        setSkills([]);
        setIsSaving(false);
        navigate("/expertise/all");
      }, 1000);
    },
    onError: (err) => {
      console.error("Save Error:", err);
      setIsSaving(false);
      toast.error(err.response?.data?.message || err.message || "Failed to add expertise.");
    },
  });

  const onSubmit = async (data) => {
    if (skills.length === 0) {
      return toast.error("Please add at least one skill or tool tag!");
    }

    try {
      setIsSaving(true);
      const payload = {
        title: data.title,
        category: data.category,
        iconType: data.iconType,
        description: data.description,
        skills: skills,
      };

      await createExpertise(payload);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100 font-sans relative">
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">Add New Expertise</h1>
            <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Skills & Domain
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Define your core competencies, tech stack, or professional skill domain.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Domain / Expertise Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Literacy or Academic Strengths"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.title ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("title", { required: "Expertise title is required" })}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>

            {/* Category Pill Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" /> Category Badge <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. OFFICE TECH, DATA & SAAS, METHODOLOGY"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.category ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("category", { required: "Category badge is required" })}
              />
              {errors.category && <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>}
            </div>

            {/* Icon Type Selection */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" /> Card Icon Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "monitor", label: "Monitor / Computer" },
                  { id: "binary", label: "Binary / Data (01/10)" },
                  { id: "brain", label: "Brain / Methodology" },
                ].map((iconOption) => (
                  <label
                    key={iconOption.id}
                    className="flex items-center gap-2 p-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl cursor-pointer hover:border-amber-400/40 transition"
                  >
                    <input
                      type="radio"
                      value={iconOption.id}
                      className="text-amber-400 accent-amber-400"
                      {...register("iconType")}
                    />
                    <span className="text-xs font-semibold text-slate-200">{iconOption.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Skill / Tools Tags Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Skills & Tools Pills <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill(e)}
                placeholder="Type a skill (e.g. Microsoft Office) and press Enter or Add"
                className="flex-1 px-4 py-2.5 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 py-2.5 bg-emerald-950/80 border border-emerald-500/30 hover:bg-emerald-900/80 text-amber-300 text-xs font-bold rounded-2xl transition cursor-pointer"
              >
                Add Tag
              </button>
            </div>

            {/* Added Skills List */}
            <div className="flex flex-wrap gap-2 p-3 bg-[#121c17]/40 rounded-2xl border border-emerald-500/10 min-h-[50px]">
              {skills.length === 0 ? (
                <p className="text-xs text-slate-500 self-center font-mono">No skills added yet. Add items to display as pills.</p>
              ) : (
                skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121c17] border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-400 ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Summary / Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Well-versed in computer office packages, Google applications, and internet tools..."
              className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                errors.description ? "border-rose-500" : "border-emerald-500/20"
              } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition resize-none shadow-inner`}
              {...register("description", { required: "Description is required" })}
            ></textarea>
            {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Expertise</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddExpertise;