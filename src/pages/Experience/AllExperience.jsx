import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CloudUpload,
  Database,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AllExperience = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingExperience, setEditingExperience] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: experiences = [], isLoading, isError, error } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const res = await axiosSecure.get("/experiences");
      return res.data;
    },
  });

  const { mutateAsync: deleteExperience, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/experiences/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Experience record deleted! 🗑️");
      setDeletingId(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete experience.");
    },
  });

  const filteredExperiences = experiences.filter((item) => {
    const roleMatch = item.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatch = item.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const locMatch = item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch || companyMatch || locMatch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">All Experiences</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                {experiences.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage, update, or remove work experience timeline items.
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role, company, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
          />
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1410]/80 rounded-3xl border border-amber-400/20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono text-emerald-300">Loading experience history...</span>
        </div>
      ) : isError ? (
        <div className="bg-rose-950/40 border border-rose-500/30 p-6 rounded-3xl text-center text-rose-300">
          <p className="font-extrabold text-sm">Failed to load experiences!</p>
          <p className="text-xs text-rose-400 font-mono mt-1">{error?.message}</p>
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <Briefcase className="w-12 h-12 mx-auto text-emerald-500/40" />
          <p className="text-base font-extrabold text-white">No Experiences Found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or add a new job role.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExperiences.map((item) => (
            <div
              key={item._id}
              className="bg-[#0d1410]/80 border border-amber-400/20 p-6 rounded-3xl shadow-2xl backdrop-blur-xl hover:border-amber-400/40 transition-all flex flex-col md:flex-row items-start justify-between gap-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#121c17] rounded-2xl border border-emerald-500/30 flex items-center justify-center shrink-0 p-2 overflow-hidden shadow-inner">
                  {item.companyLogo ? (
                    <img src={item.companyLogo} alt={item.company} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-amber-400" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {item.role}
                    </h3>
                    {item.isCurrent && (
                      <span className="bg-emerald-950/80 border border-emerald-500/30 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Present Role
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {item.company}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                      {item.startDate ? new Date(item.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "N/A"} -{" "}
                      {item.isCurrent ? "Present" : item.endDate ? new Date(item.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "N/A"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-2 bg-[#121c17]/60 p-3.5 rounded-2xl border border-emerald-500/20 mt-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <button
                  onClick={() => setEditingExperience(item)}
                  className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-900/80 text-amber-300 transition-all cursor-pointer"
                  title="Edit Experience"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(item._id)}
                  className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all cursor-pointer"
                  title="Delete Experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- EDIT EXPERIENCE MODAL --- */}
      {editingExperience && (
        <EditExperienceModal
          experience={editingExperience}
          onClose={() => setEditingExperience(null)}
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
              <h3 className="text-lg font-extrabold text-white">Delete Experience?</h3>
              <p className="text-xs text-slate-400 font-medium">
                This experience record will be permanently deleted from your profile.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-[#121c17] border border-emerald-500/30 hover:bg-emerald-950/60 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => deleteExperience(deletingId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-70 cursor-pointer"
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
/*                  EDIT EXPERIENCE MODAL COMPONENT                     */
/* ==================================================================== */
const EditExperienceModal = ({ experience, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [logoPreview, setLogoPreview] = useState(experience.companyLogo || null);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: experience.role || "",
      company: experience.company || "",
      location: experience.location || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate === "Present" ? "" : experience.endDate || "",
      isCurrent: experience.isCurrent || false,
      description: experience.description || "",
      logoFile: null,
    },
  });

  const startDateVal = watch("startDate");
  const endDateVal = watch("endDate");
  const isCurrentVal = watch("isCurrent");
  const selectedLogoFile = watch("logoFile");

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startMonth, setStartMonth] = useState(experience.startDate ? new Date(experience.startDate) : new Date());
  const [endMonth, setEndMonth] = useState(experience.endDate && experience.endDate !== "Present" ? new Date(experience.endDate) : new Date());

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startDateRef.current && !startDateRef.current.contains(e.target)) setShowStartDatePicker(false);
      if (endDateRef.current && !endDateRef.current.contains(e.target)) setShowEndDatePicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { mutateAsync: updateExperience } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.patch(`/experiences/${experience._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Experience updated successfully! 📝");

      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err) => {
      console.error("Update Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to update experience.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("logoFile", file, { shouldValidate: true });
      if (logoPreview && logoPreview !== experience.companyLogo) URL.revokeObjectURL(logoPreview);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const onSubmit = async (data) => {
    try {
      let logoUrl = experience.companyLogo;

      if (data.logoFile) {
        setUploadStep(1);
        setUploadProgress(30);

        const imgData = new FormData();
        imgData.append("image", data.logoFile);

        setUploadProgress(50);
        const imgBbRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`,
          { method: "POST", body: imgData }
        );

        const imgBbResult = await imgBbRes.json();
        if (!imgBbResult.success) throw new Error("Logo upload failed.");
        logoUrl = imgBbResult.data.display_url;
      }

      setUploadStep(2);
      setUploadProgress(75);

      const payload = {
        role: data.role,
        company: data.company,
        location: data.location,
        startDate: data.startDate,
        endDate: data.isCurrent ? "Present" : data.endDate,
        isCurrent: data.isCurrent,
        description: data.description,
        companyLogo: logoUrl,
      };

      await updateExperience(payload);

    } catch (err) {
      console.error(err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.message || "Something went wrong!");
    }
  };

  const isUpdating = uploadStep > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#090e0b]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      
      {/* Overlay Loader */}
      {isUpdating && (
        <div className="absolute inset-0 z-[60] bg-[#0d1410]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/30 text-amber-400 rounded-full flex items-center justify-center shadow-lg">
            {uploadStep === 1 && <CloudUpload className="w-8 h-8 animate-bounce" />}
            {uploadStep === 2 && <Database className="w-8 h-8 animate-pulse" />}
            {uploadStep === 3 && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-white">
              {uploadStep === 1 && "Uploading Logo..."}
              {uploadStep === 2 && "Applying Changes..."}
              {uploadStep === 3 && "Updated Successfully!"}
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Please wait while changes sync.</p>
          </div>
          <div className="w-64 bg-[#121c17] rounded-full h-2.5 overflow-hidden border border-emerald-500/20">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Modal Content */}
      <div className="bg-[#0d1410] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-400/30 overflow-hidden relative my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#121c17]/80 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/30 text-amber-400 rounded-2xl shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Edit Experience Record
              </h2>
              <p className="text-xs text-slate-400 font-medium">Update job details, duration, or responsibilities.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Role *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("role", { required: "Role is required" })}
              />
              {errors.role && <p className="text-xs text-rose-400 mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Company *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("company", { required: "Company is required" })}
              />
              {errors.company && <p className="text-xs text-rose-400 mt-1">{errors.company.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("location")}
              />
            </div>

            {/* Start Date */}
            <div className="relative" ref={startDateRef}>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Date *</label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <div
                    onClick={() => setShowStartDatePicker((prev) => !prev)}
                    className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className={field.value ? "text-white font-semibold" : "text-slate-500"}>
                      {field.value ? new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Select..."}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              />
              {showStartDatePicker && (
                <ModalCalendarPopover
                  currentMonth={startMonth}
                  setCurrentMonth={setStartMonth}
                  selectedDate={startDateVal}
                  onSelect={(date) => {
                    setValue("startDate", date, { shouldValidate: true });
                    setShowStartDatePicker(false);
                  }}
                />
              )}
            </div>

            {/* Currently Working Toggle */}
            <div className="md:col-span-2 flex items-center gap-3 bg-[#121c17]/60 p-3 rounded-xl border border-emerald-500/20">
              <input
                type="checkbox"
                id="editIsCurrent"
                className="w-4 h-4 text-amber-400 accent-amber-400 rounded cursor-pointer"
                {...register("isCurrent")}
              />
              <label htmlFor="editIsCurrent" className="text-xs font-bold text-amber-300 cursor-pointer">
                I am currently working in this role
              </label>
            </div>

            {/* End Date */}
            {!isCurrentVal && (
              <div className="relative md:col-span-2" ref={endDateRef}>
                <label className="block text-xs font-bold text-slate-300 mb-1">End Date *</label>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: !isCurrentVal ? "End date required" : false }}
                  render={({ field }) => (
                    <div
                      onClick={() => setShowEndDatePicker((prev) => !prev)}
                      className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs flex items-center justify-between cursor-pointer"
                    >
                      <span className={field.value ? "text-white font-semibold" : "text-slate-500"}>
                        {field.value ? new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Select..."}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                />
                {showEndDatePicker && (
                  <ModalCalendarPopover
                    currentMonth={endMonth}
                    setCurrentMonth={setEndMonth}
                    selectedDate={endDateVal}
                    onSelect={(date) => {
                      setValue("endDate", date, { shouldValidate: true });
                      setShowEndDatePicker(false);
                    }}
                  />
                )}
              </div>
            )}

          </div>

          {/* Company Logo Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Company Logo</label>
            {!logoPreview ? (
              <div className="relative border-2 border-dashed border-emerald-500/30 bg-[#121c17]/60 rounded-2xl p-4 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-300 font-semibold">Click to upload new logo</p>
              </div>
            ) : (
              <div className="relative p-3 bg-[#121c17]/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain bg-white/10 rounded-xl p-1 border border-emerald-500/20" />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {selectedLogoFile ? selectedLogoFile.name : "Current Company Logo"}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium">Ready to update</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setValue("logoFile", null); setLogoPreview(null); }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
            <textarea
              rows="4"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60 resize-none"
              {...register("description", { required: "Description is required" })}
            ></textarea>
            {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>}
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

// Dark Modal Calendar Popover with Direct Year & Month Dropdowns
const ModalCalendarPopover = ({ currentMonth, setCurrentMonth, selectedDate, onSelect }) => {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 45 }, (_, i) => currentYear - i); // Generates 1982 to Current Year
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-[#0d1410] border border-amber-400/30 rounded-2xl shadow-2xl p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-900/40 gap-1">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1 hover:bg-emerald-950/60 text-amber-400 rounded-lg transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* Month Selector Dropdown */}
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            className="bg-[#121c17] text-white font-bold text-xs py-1 px-1.5 rounded-lg border border-emerald-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx} className="bg-[#0d1410] text-white">
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector Dropdown */}
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="bg-[#121c17] text-amber-400 font-bold text-xs py-1 px-1.5 rounded-lg border border-emerald-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#0d1410] text-amber-300 font-bold">
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1 hover:bg-emerald-950/60 text-amber-400 rounded-lg transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSelected 
                  ? "bg-amber-400 text-slate-950 font-bold shadow-md" 
                  : "hover:bg-emerald-950/60 text-slate-200"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AllExperience;