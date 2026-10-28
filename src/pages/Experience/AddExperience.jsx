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
  FileText
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
  const [uploadStep, setUploadStep] = useState(0); // 0: Idle, 1: ImageBB, 2: DB Sync, 3: Done
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

  // Outside click to close datepickers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startDateRef.current && !startDateRef.current.contains(e.target)) setShowStartDatePicker(false);
      if (endDateRef.current && !endDateRef.current.contains(e.target)) setShowEndDatePicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TanStack Query Mutation
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

  // Image File Processors
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

  // Submit Handler
  const onSubmit = async (data) => {
    try {
      let logoUrl = "";

      // Step 1: Uploading Logo to ImageBB
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

      // Step 2: Save to DB
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
    <div className="w-full bg-[#F8FAFC] min-h-screen font-sans p-4 sm:p-6 lg:pr-24 relative">
      
      {/* Dynamic Overlay Loader */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-[#163A2D]/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-75"></div>
              <div className="relative z-10 w-20 h-20 bg-[#163A2D] text-amber-300 rounded-full flex items-center justify-center shadow-lg">
                {uploadStep === 1 && <CloudUpload className="w-10 h-10 animate-bounce" />}
                {uploadStep === 2 && <Database className="w-10 h-10 animate-pulse" />}
                {uploadStep === 3 && <CheckCircle2 className="w-10 h-10 text-emerald-400" />}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#163A2D] font-['Playfair_Display',serif]">
                {uploadStep === 1 && "Uploading Company Logo..."}
                {uploadStep === 2 && "Saving Experience Record..."}
                {uploadStep === 3 && "Published Successfully!"}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {uploadStep === 1 && "Uploading logo to ImageBB CDN..."}
                {uploadStep === 2 && "Syncing with database..."}
                {uploadStep === 3 && "Redirecting to experiences list..."}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 border border-emerald-100">
                <div
                  className="bg-gradient-to-r from-[#163A2D] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-emerald-800">
                <span>PROGRESS</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="p-3 bg-[#163A2D] text-amber-300 rounded-xl shadow-md">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#163A2D] font-['Playfair_Display',serif]">
              Add Work Experience
            </h1>
            <p className="text-sm text-gray-500 font-medium">Add past or present work roles, tenure, and achievements.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Job Role */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-700" /> Job Role / Position <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Developer"
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${
                    errors.role ? "border-rose-500" : "border-gray-200"
                  } rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all`}
                  {...register("role", { required: "Job Role is required" })}
                />
                {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role.message}</p>}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" /> Company / Organization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Inc."
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${
                    errors.company ? "border-rose-500" : "border-gray-200"
                  } rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all`}
                  {...register("company", { required: "Company name is required" })}
                />
                {errors.company && <p className="text-xs text-rose-500 mt-1">{errors.company.message}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" /> Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                  {...register("location")}
                />
              </div>

              {/* Start Date */}
              <div className="relative" ref={startDateRef}>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-700" /> Start Date <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <div
                      onClick={() => setShowStartDatePicker((prev) => !prev)}
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${
                        errors.startDate ? "border-rose-500" : "border-gray-200"
                      } rounded-xl text-sm flex items-center justify-between cursor-pointer hover:bg-emerald-50/40 transition-all`}
                    >
                      <span className={field.value ? "text-gray-800 font-semibold" : "text-gray-400"}>
                        {field.value
                          ? new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : "Select start date..."}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                />
                {errors.startDate && <p className="text-xs text-rose-500 mt-1">{errors.startDate.message}</p>}

                {/* Popover Calendar */}
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
              <div className="md:col-span-2 flex items-center gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                <input
                  type="checkbox"
                  id="isCurrent"
                  className="w-4 h-4 text-[#163A2D] accent-[#163A2D] rounded cursor-pointer"
                  {...register("isCurrent")}
                />
                <label htmlFor="isCurrent" className="text-xs font-bold text-[#163A2D] cursor-pointer">
                  I am currently working in this role
                </label>
              </div>

              {/* End Date (Disabled if Current) */}
              {!isCurrentVal && (
                <div className="relative md:col-span-2" ref={endDateRef}>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-emerald-700" /> End Date <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: !isCurrentVal ? "End date is required" : false }}
                    render={({ field }) => (
                      <div
                        onClick={() => setShowEndDatePicker((prev) => !prev)}
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${
                          errors.endDate ? "border-rose-500" : "border-gray-200"
                        } rounded-xl text-sm flex items-center justify-between cursor-pointer hover:bg-emerald-50/40 transition-all`}
                      >
                        <span className={field.value ? "text-gray-800 font-semibold" : "text-gray-400"}>
                          {field.value
                            ? new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                            : "Select end date..."}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                  />
                  {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate.message}</p>}

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
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2">Company Logo (Optional)</label>
              {!logoPreview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
                  }}
                  className={`relative border-2 border-dashed border-emerald-300 bg-gray-50 rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging ? "bg-emerald-50 scale-[1.01]" : "hover:bg-emerald-50/30"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Click or drag & drop company logo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              ) : (
                <div className="relative p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-contain rounded-xl bg-white p-2 border border-emerald-200" />
                    <div>
                      <p className="text-sm font-bold text-[#163A2D] truncate max-w-xs">{selectedLogoFile?.name}</p>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">Ready to upload</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleRemoveLogo} className="p-2 text-gray-400 hover:text-rose-600 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" /> Description / Responsibilities <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="4"
                placeholder="Describe your primary responsibilities, projects, technologies used, and key achievements..."
                className={`w-full px-4 py-2.5 bg-gray-50 border ${
                  errors.description ? "border-rose-500" : "border-gray-200"
                } rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all resize-none`}
                {...register("description", { required: "Description is required" })}
              ></textarea>
              {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUploading || isSaving}
                className="px-8 py-3.5 bg-[#163A2D] hover:bg-[#0C2219] text-amber-300 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    <span>Publish Experience</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Calendar Popover Component
const CalendarPopover = ({ currentMonth, setCurrentMonth, selectedDate, onSelect }) => {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white border border-emerald-100 rounded-2xl shadow-xl p-3 animate-in fade-in">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1 hover:bg-emerald-50 text-emerald-800 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-xs text-[#163A2D]">
          {currentMonth.toLocaleString("default", { month: "short" })} {currentMonth.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1 hover:bg-emerald-50 text-emerald-800 rounded-lg"
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
              className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected ? "bg-[#163A2D] text-amber-300 font-bold" : "hover:bg-emerald-50 text-gray-700"
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