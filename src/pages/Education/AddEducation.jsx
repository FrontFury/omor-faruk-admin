import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hook/useAxiosSecure";
import { 
  GraduationCap, 
  Building2, 
  Award, 
  Calendar, 
  Send, 
  Sparkles, 
  Loader2, 
  FileText 
} from "lucide-react";
import toast from "react-hot-toast";

const AddEducation = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    degree: "",
    institution: "",
    passingYear: "",
    score: "",
    description: "",
    tags: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addAcademicMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.post("/academics", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["academics"]);
      toast.success(data?.message || "Academic background added successfully!");
      navigate("/education/all");
    },
    onError: (error) => {
      console.error("Add error:", error);
      toast.error(error?.response?.data?.message || "Failed to add academic record");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
    };
    addAcademicMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">Add Academic Record</h1>
            <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Education
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Create new academic qualifications, doctoral research, or degree entries.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title / Degree Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-amber-400" />
                Degree Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Master of Business Administration (MBA)"
                className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
              />
            </div>

            {/* Major / Concentration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                Major / Concentration
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                required
                placeholder="e.g. Major: Accounting & Information Systems (AIS)"
                className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
              />
            </div>

            {/* Institution */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 size={14} className="text-amber-400" />
                Institution Name
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                placeholder="e.g. University of Dhaka, Bangladesh"
                className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
              />
            </div>

            {/* Passing Year / Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-400" />
                Passing Year / Duration
              </label>
              <input
                type="text"
                name="passingYear"
                value={formData.passingYear}
                onChange={handleChange}
                required
                placeholder="e.g. 2011 (1 Year Regular)"
                className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
              />
            </div>

            {/* Score / CGPA */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                CGPA / Score
              </label>
              <input
                type="text"
                name="score"
                value={formData.score}
                onChange={handleChange}
                placeholder="e.g. CGPA: 3.81 / 4.00"
                className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
              />
            </div>

            {/* Tags (Comma Separated) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText size={14} className="text-amber-400" />
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. First Class Division, Faculty Honors, Top Percentile"
                className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText size={14} className="text-amber-400" />
              Description & Detail
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed summary of curriculum focus, thesis, or academic performance..."
              className="w-full bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition resize-none shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={addAcademicMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3.5 rounded-2xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            {addAcademicMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-950" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Add Academic Record</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEducation;