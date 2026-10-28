import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  BookOpen,
  UserCheck,
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
  Bookmark,
  ExternalLink,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hook/useAxiosSecure";

const AllPublications = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingPublication, setEditingPublication] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // GET All Publications
  const { data: publications = [], isLoading, isError, error } = useQuery({
    queryKey: ["publications"],
    queryFn: async () => {
      const res = await axiosSecure.get("/publications");
      return res.data;
    },
  });

  // DELETE Mutation
  const { mutateAsync: deletePublication, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/publications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication record deleted! 🗑️");
      setDeletingId(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete publication.");
    },
  });

  // Search Filter
  const filteredPublications = publications.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const authorMatch = item.authors?.toLowerCase().includes(searchTerm.toLowerCase());
    const pubMatch = item.publisher?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || authorMatch || pubMatch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">All Publications</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                {publications.length} Papers
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage, edit, or remove your academic and research articles.
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, authors, publisher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
          />
        </div>
      </div>

      {/* CONTENT LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1410]/80 rounded-3xl border border-amber-400/20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono text-emerald-300">Loading publication list...</span>
        </div>
      ) : isError ? (
        <div className="bg-rose-950/40 border border-rose-500/30 p-6 rounded-3xl text-center text-rose-300">
          <p className="font-extrabold text-sm">Failed to load publications!</p>
          <p className="text-xs text-rose-400 font-mono mt-1">{error?.message}</p>
        </div>
      ) : filteredPublications.length === 0 ? (
        <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <BookOpen className="w-12 h-12 mx-auto text-emerald-500/40" />
          <p className="text-base font-extrabold text-white">No Publications Found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or add a new publication.</p>
        </div>
      ) : (
        /* CUSTOM DESIGNED PUBLICATION CARDS */
        <div className="space-y-4">
          {filteredPublications.map((item, index) => {
            const numIndex = String(index + 1).padStart(2, "0");
            return (
              <div
                key={item._id}
                className="bg-[#0a110d]/90 border border-emerald-900/60 p-6 rounded-3xl shadow-2xl backdrop-blur-xl hover:border-amber-400/40 transition-all flex flex-col md:flex-row items-start justify-between gap-6 group relative"
              >
                <div className="flex items-start gap-4 w-full">
                  
                  {/* Number Badge (01, 02...) */}
                  <div className="w-11 h-11 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <span className="text-amber-400 text-xs font-mono font-extrabold">{numIndex}</span>
                  </div>

                  <div className="space-y-3 w-full">
                    {/* Status & Year Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-950/90 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} className="text-amber-400" />
                        {item.status || "ACCEPTED"}
                      </span>
                      {item.publicationYear && (
                        <span className="bg-[#121c17] border border-emerald-500/20 text-slate-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full">
                          {item.publicationYear}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Authors */}
                    <p className="text-xs font-medium text-slate-400">
                      <span className="text-slate-500">Authors:</span> {item.authors}
                    </p>

                    {/* Divider & Publisher */}
                    <div className="pt-2 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <BookOpen size={14} className="text-amber-400" />
                        <span>{item.publisher}</span>
                      </div>

                      {item.publicationUrl && (
                        <a
                          href={item.publicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition"
                        >
                          View Paper <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  <button
                    onClick={() => setEditingPublication(item)}
                    className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-900/80 text-amber-300 transition-all cursor-pointer"
                    title="Edit Publication"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(item._id)}
                    className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all cursor-pointer"
                    title="Delete Publication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- EDIT PUBLICATION MODAL --- */}
      {editingPublication && (
        <EditPublicationModal
          publication={editingPublication}
          onClose={() => setEditingPublication(null)}
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
              <h3 className="text-lg font-extrabold text-white">Delete Publication?</h3>
              <p className="text-xs text-slate-400 font-medium">
                This research record will be permanently deleted from your profile.
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
                onClick={() => deletePublication(deletingId)}
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
/*                 EDIT PUBLICATION MODAL COMPONENT                     */
/* ==================================================================== */
const EditPublicationModal = ({ publication, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [imagePreview, setImagePreview] = useState(publication.coverImage || null);
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
      title: publication.title || "",
      authors: publication.authors || "",
      publisher: publication.publisher || "",
      publicationYear: publication.publicationYear || new Date().getFullYear().toString(),
      status: publication.status || "ACCEPTED",
      publicationUrl: publication.publicationUrl || "",
      abstract: publication.abstract || "",
      coverImageFile: null,
    },
  });

  const selectedImageFile = watch("coverImageFile");
  const publishedYearVal = watch("publicationYear");

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

  // UPDATE MUTATION (PATCH)
  const { mutateAsync: updatePublication } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.patch(`/publications/${publication._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Publication updated successfully! 📝");

      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err) => {
      console.error("Update Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to update publication.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("coverImageFile", file, { shouldValidate: true });
      if (imagePreview && imagePreview !== publication.coverImage) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = publication.coverImage;

      if (data.coverImageFile) {
        setUploadStep(1);
        setUploadProgress(30);

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

      await updatePublication(payload);

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
              {uploadStep === 1 && "Uploading Cover Image..."}
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
                Edit Publication Record
              </h2>
              <p className="text-xs text-slate-400 font-medium">Update research title, authors, or publication link.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Authors *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("authors", { required: "Authors is required" })}
              />
              {errors.authors && <p className="text-xs text-rose-400 mt-1">{errors.authors.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Publisher *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("publisher", { required: "Publisher is required" })}
              />
              {errors.publisher && <p className="text-xs text-rose-400 mt-1">{errors.publisher.message}</p>}
            </div>

            {/* Publication Year */}
            <div className="relative" ref={yearPickerRef}>
              <label className="block text-xs font-bold text-slate-300 mb-1">Publication Year *</label>
              <Controller
                name="publicationYear"
                control={control}
                rules={{ required: "Year is required" }}
                render={({ field }) => (
                  <div
                    onClick={() => setShowYearPicker((prev) => !prev)}
                    className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className={field.value ? "text-white font-semibold" : "text-slate-500"}>
                      {field.value || "Select year..."}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              />
              {showYearPicker && (
                <ModalCalendarPopover
                  currentMonth={yearPickerMonth}
                  setCurrentMonth={setYearPickerMonth}
                  selectedDate={publishedYearVal}
                  onSelect={(year) => {
                    setValue("publicationYear", year, { shouldValidate: true });
                    setShowYearPicker(false);
                  }}
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
              <select
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60 cursor-pointer"
                {...register("status")}
              >
                <option value="ACCEPTED" className="bg-[#0d1410] text-amber-300">ACCEPTED</option>
                <option value="PUBLISHED" className="bg-[#0d1410] text-emerald-400">PUBLISHED</option>
                <option value="UNDER REVIEW" className="bg-[#0d1410] text-slate-300">UNDER REVIEW</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Publication URL</label>
              <input
                type="url"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("publicationUrl")}
              />
            </div>

          </div>

          {/* Cover Image Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Cover Image</label>
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-emerald-500/30 bg-[#121c17]/60 rounded-2xl p-4 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-300 font-semibold">Click to upload new cover image</p>
              </div>
            ) : (
              <div className="relative p-3 bg-[#121c17]/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Cover" className="w-12 h-12 object-cover bg-white/10 rounded-xl border border-emerald-500/20" />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {selectedImageFile ? selectedImageFile.name : "Current Cover Image"}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium">Ready to update</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setValue("coverImageFile", null); setImagePreview(null); }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Abstract</label>
            <textarea
              rows="4"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60 resize-none"
              {...register("abstract")}
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

// Modal Year Popover
const ModalCalendarPopover = ({ currentMonth, setCurrentMonth, selectedDate, onSelect }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-[#0d1410] border border-amber-400/30 rounded-2xl shadow-2xl p-3 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2 p-1">
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

export default AllPublications;