import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  PlusCircle,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  CloudUpload,
  Database,
  FileText,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AddExperience = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      logoFile: null,
    },
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Progress States
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Watched Values
  const startDateVal = watch("startDate");
  const endDateVal = watch("endDate");
  const isCurrentVal = watch("isCurrent");
  const selectedLogoFile = watch("logoFile");

  // DatePicker States
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startMonth, setStartMonth] = useState(new Date());
  const [endMonth, setEndMonth] = useState(new Date());

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

  const { mutateAsync: createExperience, isPending: isSaving } = useMutation({
    mutationFn: async (newExperience) => {
      const res = await axiosSecure.post("/experiences", newExperience);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Experience added successfully! 💼✨");

      setTimeout(() => {
        reset();
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
        setUploadStep(0);
        setUploadProgress(0);
        navigate("/experience/all");
      }, 1200);
    },
    onError: (err) => {
      console.error("Save Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || err.message || "Failed to save experience.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("logoFile", file, { shouldValidate: true });
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const handleRemoveLogo = () => {
    setValue("logoFile", null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      let logoUrl = "";

      setUploadStep(1);
      setUploadProgress(25);

      if (data.logoFile) {
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
        createdAt: new Date().toISOString(),
      };

      await createExperience(payload);

    } catch (err) {
      console.error("Submission Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.message || "Something went wrong!");
    }
  };

  const isUploading = uploadStep > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100 font-sans relative">
      
      {/* Dynamic Overlay Loader */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-[#090e0b]/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-[#0d1410] border border-amber-400/30 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-75"></div>
              <div className="relative z-10 w-20 h-20 bg-emerald-950 border border-emerald-500/30 text-amber-400 rounded-full flex items-center justify-center shadow-lg">
                {uploadStep === 1 && <CloudUpload className="w-10 h-10 animate-bounce" />}
                {uploadStep === 2 && <Database className="w-10 h-10 animate-pulse" />}
                {uploadStep === 3 && <CheckCircle2 className="w-10 h-10 text-emerald-400" />}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">
                {uploadStep === 1 && "Uploading Company Logo..."}
                {uploadStep === 2 && "Saving Experience Record..."}
                {uploadStep === 3 && "Published Successfully!"}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {uploadStep === 1 && "Uploading logo to ImageBB CDN..."}
                {uploadStep === 2 && "Syncing with database..."}
                {uploadStep === 3 && "Redirecting to experiences list..."}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#121c17] rounded-full h-3 overflow-hidden p-0.5 border border-emerald-500/20">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-amber-300">
                <span>PROGRESS</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">Add Work Experience</h1>
            <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Career
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Add past or present work roles, tenure, and achievements.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Job Role */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-amber-400" /> Job Role / Position <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Full Stack Developer"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.role ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("role", { required: "Job Role is required" })}
              />
              {errors.role && <p className="text-xs text-rose-400 mt-1">{errors.role.message}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" /> Company / Organization <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Google Inc."
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.company ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("company", { required: "Company name is required" })}
              />
              {errors.company && <p className="text-xs text-rose-400 mt-1">{errors.company.message}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" /> Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA (or Remote)"
                className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
                {...register("location")}
              />
            </div>

            {/* Start Date */}
            <div className="relative" ref={startDateRef}>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-amber-400" /> Start Date <span className="text-rose-400">*</span>
              </label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <div
                    onClick={() => setShowStartDatePicker((prev) => !prev)}
                    className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                      errors.startDate ? "border-rose-500" : "border-emerald-500/20"
                    } rounded-2xl text-xs flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition shadow-inner`}
                  >
                    <span className={field.value ? "text-white font-semibold" : "text-slate-500"}>
                      {field.value
                        ? new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : "Select start date..."}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              />
              {errors.startDate && <p className="text-xs text-rose-400 mt-1">{errors.startDate.message}</p>}

              {showStartDatePicker && (
                <CalendarPopover
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
            <div className="md:col-span-2 flex items-center gap-3 bg-[#121c17]/60 p-4 rounded-2xl border border-emerald-500/20">
              <input
                type="checkbox"
                id="isCurrent"
                className="w-4 h-4 text-amber-400 accent-amber-400 rounded cursor-pointer"
                {...register("isCurrent")}
              />
              <label htmlFor="isCurrent" className="text-xs font-bold text-amber-300 cursor-pointer">
                I am currently working in this role
              </label>
            </div>

            {/* End Date */}
            {!isCurrentVal && (
              <div className="relative md:col-span-2" ref={endDateRef}>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-amber-400" /> End Date <span className="text-rose-400">*</span>
                </label>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: !isCurrentVal ? "End date is required" : false }}
                  render={({ field }) => (
                    <div
                      onClick={() => setShowEndDatePicker((prev) => !prev)}
                      className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                        errors.endDate ? "border-rose-500" : "border-emerald-500/20"
                      } rounded-2xl text-xs flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition shadow-inner`}
                    >
                      <span className={field.value ? "text-white font-semibold" : "text-slate-500"}>
                        {field.value
                          ? new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : "Select end date..."}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                />
                {errors.endDate && <p className="text-xs text-rose-400 mt-1">{errors.endDate.message}</p>}

                {showEndDatePicker && (
                  <CalendarPopover
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
            <label className="block text-xs font-bold text-slate-300 mb-2">Company Logo (Optional)</label>
            {!logoPreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
                }}
                className={`relative border-2 border-dashed border-emerald-500/30 bg-[#121c17]/60 rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging ? "bg-emerald-950/40 border-amber-400/50" : "hover:border-amber-400/40"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Click or drag & drop company logo</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="relative p-4 bg-[#121c17]/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={logoPreview} alt="Logo Preview" className="w-14 h-14 object-contain rounded-xl bg-white/10 p-2 border border-emerald-500/20" />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-xs">{selectedLogoFile?.name}</p>
                    <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Ready to upload</p>
                  </div>
                </div>
                <button type="button" onClick={handleRemoveLogo} className="p-2 text-slate-400 hover:text-rose-400 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Description / Responsibilities <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows="4"
              placeholder="Describe your primary responsibilities, projects, technologies used, and key achievements..."
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
              disabled={isUploading || isSaving}
              className="w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Experience</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Reusable Calendar Popover with Direct Year & Month Dropdowns
const CalendarPopover = ({ currentMonth, setCurrentMonth, selectedDate, onSelect }) => {
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
      
      {/* Popover Header with Quick Selection Dropdowns */}
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

          {/* Year Selector Dropdown (Quick Jump to 2011 or any year) */}
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

export default AddExperience;