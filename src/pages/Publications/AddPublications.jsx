import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  UserCheck,
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
  Sparkles,
  Bookmark,
  ExternalLink,
  Award
} from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AddPublications = () => {
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
      title: "",
      authors: "",
      publisher: "",
      publicationYear: new Date().getFullYear().toString(),
      status: "ACCEPTED",
      publicationUrl: "",
      abstract: "",
      coverImageFile: null,
    },
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Progress States
  const [uploadStep, setUploadStep] = useState(0); // 0: Idle, 1: ImageBB, 2: DB Sync, 3: Done
  const [uploadProgress, setUploadProgress] = useState(0);

  // Watched Values
  const selectedImageFile = watch("coverImageFile");
  const publishedYearVal = watch("publicationYear");

  // Year Picker Popover State
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPickerMonth, setYearPickerMonth] = useState(new Date());
  const yearPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (yearPickerRef.current && !yearPickerRef.current.contains(e.target)) {
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TanStack Query Mutation
  const { mutateAsync: createPublication, isPending: isSaving } = useMutation({
    mutationFn: async (newPublication) => {
      const res = await axiosSecure.post("/publications", newPublication);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Publication added successfully! 📚✨");

      setTimeout(() => {
        reset();
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setUploadStep(0);
        setUploadProgress(0);
        navigate("/publications/all");
      }, 1200);
    },
    onError: (err) => {
      console.error("Save Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || err.message || "Failed to add publication.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("coverImageFile", file, { shouldValidate: true });
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const handleRemoveImage = () => {
    setValue("coverImageFile", null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = "";

      // Step 1: Upload Image (if provided)
      if (data.coverImageFile) {
        setUploadStep(1);
        setUploadProgress(25);

        const imgData = new FormData();
        imgData.append("image", data.coverImageFile);

        setUploadProgress(50);
        const imgBbRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`,
          { method: "POST", body: imgData }
        );

        const imgBbResult = await imgBbRes.json();
        if (!imgBbResult.success) throw new Error("Image upload failed.");
        imageUrl = imgBbResult.data.display_url;
      }

      // Step 2: Save to Database
      setUploadStep(2);
      setUploadProgress(75);

      const payload = {
        title: data.title,
        authors: data.authors,
        publisher: data.publisher,
        publicationYear: data.publicationYear,
        status: data.status,
        publicationUrl: data.publicationUrl,
        abstract: data.abstract,
        coverImage: imageUrl,
      };

      await createPublication(payload);

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
                {uploadStep === 1 && "Uploading Cover Image..."}
                {uploadStep === 2 && "Saving Publication..."}
                {uploadStep === 3 && "Published Successfully!"}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {uploadStep === 1 && "Uploading file to CDN..."}
                {uploadStep === 2 && "Syncing with database..."}
                {uploadStep === 3 && "Redirecting to publications list..."}
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
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">Add Research Publication</h1>
            <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Academic
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Add journal papers, conference articles, or book chapters to your portfolio.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" /> Research Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence Usage in Crisis Management in Smart Tourism Systems"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.title ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("title", { required: "Publication title is required" })}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>

            {/* Authors */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-400" /> Authors <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Talukder, M. B., Faruk, M. O."
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.authors ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("authors", { required: "Authors list is required" })}
              />
              {errors.authors && <p className="text-xs text-rose-400 mt-1">{errors.authors.message}</p>}
            </div>

            {/* Publisher / Journal */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-400" /> Journal / Publisher <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. IGI Global Scientific Publishing"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.publisher ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("publisher", { required: "Publisher name is required" })}
              />
              {errors.publisher && <p className="text-xs text-rose-400 mt-1">{errors.publisher.message}</p>}
            </div>

            {/* Publication Year (Picker) */}
            <div className="relative" ref={yearPickerRef}>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-amber-400" /> Publication Year <span className="text-rose-400">*</span>
              </label>
              <Controller
                name="publicationYear"
                control={control}
                rules={{ required: "Publication year is required" }}
                render={({ field }) => (
                  <div
                    onClick={() => setShowYearPicker((prev) => !prev)}
                    className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                      errors.publicationYear ? "border-rose-500" : "border-emerald-500/20"
                    } rounded-2xl text-xs flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition shadow-inner`}
                  >
                    <span className={field.value ? "text-white font-semibold" : "text-slate-500"}>
                      {field.value || "Select publication year..."}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              />
              {errors.publicationYear && <p className="text-xs text-rose-400 mt-1">{errors.publicationYear.message}</p>}

              {showYearPicker && (
                <CalendarPopover
                  currentMonth={yearPickerMonth}
                  setCurrentMonth={setYearPickerMonth}
                  selectedDate={publishedYearVal}
                  onSelect={(selectedYear) => {
                    setValue("publicationYear", selectedYear, { shouldValidate: true });
                    setShowYearPicker(false);
                  }}
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Status
              </label>
              <select
                className="w-full px-4 py-3 bg-[#121c17] border border-emerald-500/20 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-400/60 transition shadow-inner cursor-pointer"
                {...register("status")}
              >
                <option value="ACCEPTED" className="bg-[#0d1410] text-amber-300">ACCEPTED</option>
                <option value="PUBLISHED" className="bg-[#0d1410] text-emerald-400">PUBLISHED</option>
                <option value="UNDER REVIEW" className="bg-[#0d1410] text-slate-300">UNDER REVIEW</option>
              </select>
            </div>

            {/* Publication / DOI Link */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-amber-400" /> Publication / DOI URL (Optional)
              </label>
              <input
                type="url"
                placeholder="e.g. https://doi.org/10.4018/..."
                className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
                {...register("publicationUrl")}
              />
            </div>

          </div>

          {/* Cover Image Dropzone (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Cover Image / Banner (Optional)</label>
            {!imagePreview ? (
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
                <p className="text-xs font-semibold text-slate-200">Click or drag & drop cover image</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="relative p-4 bg-[#121c17]/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={imagePreview} alt="Cover Preview" className="w-14 h-14 object-cover rounded-xl bg-white/10 border border-emerald-500/20" />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-xs">{selectedImageFile?.name}</p>
                    <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Ready to upload</p>
                  </div>
                </div>
                <button type="button" onClick={handleRemoveImage} className="p-2 text-slate-400 hover:text-rose-400 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Abstract / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Abstract / Description (Optional)
            </label>
            <textarea
              rows="4"
              placeholder="Provide a brief summary or abstract of the research paper..."
              className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition resize-none shadow-inner"
              {...register("abstract")}
            ></textarea>
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
                  <span>Publish Research</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Year/Date Popover Component
const CalendarPopover = ({ currentMonth, setCurrentMonth, selectedDate, onSelect }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i); // Generates 1992 to Current Year
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            className="bg-[#121c17] text-white font-bold text-xs py-1 px-1.5 rounded-lg border border-emerald-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx} className="bg-[#0d1410] text-white">{m}</option>
            ))}
          </select>

          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="bg-[#121c17] text-amber-400 font-bold text-xs py-1 px-1.5 rounded-lg border border-emerald-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#0d1410] text-amber-300 font-bold">{y}</option>
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

      <div className="grid grid-cols-3 gap-2 p-2">
        {years.slice(0, 12).map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onSelect(y.toString())}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDate === y.toString()
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-[#121c17] text-slate-200 hover:bg-emerald-950/60 hover:text-amber-300"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddPublications;