import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hook/useAxiosSecure";
import toast from "react-hot-toast";
import {
  Trophy,
  Award,
  Building2,
  Calendar,
  Link as LinkIcon,
  Upload,
  CloudUpload,
  Database,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  FileText
} from "lucide-react";

const AddHonors = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      associatedWith: "",
      issuer: "",
      issueDate: "",
      verificationUrl: "",
      description: "",
      imageFile: null,
    },
  });

  const selectedImageFile = watch("imageFile");

  const { mutateAsync: addHonor } = useMutation({
    mutationFn: async (newHonor) => {
      const res = await axiosSecure.post("/honors", newHonor);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["honors"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Honor/Award added successfully! 🏆");

      setTimeout(() => {
        setUploadStep(0);
        setUploadProgress(0);
        reset();
        setImagePreview(null);
        navigate("/honor/all");
      }, 1200);
    },
    onError: (err) => {
      console.error("Add Honor Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to add Honor/Award.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("imageFile", file, { shouldValidate: true });
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image!");
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = "";

      if (data.imageFile) {
        setUploadStep(1);
        setUploadProgress(30);

        const imgData = new FormData();
        imgData.append("image", data.imageFile);

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
        associatedWith: data.associatedWith,
        issuer: data.issuer,
        issueDate: data.issueDate,
        verificationUrl: data.verificationUrl,
        description: data.description,
        image: imageUrl,
      };

      await addHonor(payload);
    } catch (err) {
      console.error(err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.message || "An error occurred while saving!");
    }
  };

  const isUploading = uploadStep > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 relative text-slate-100 font-sans">
      {/* Dark Overlay Loader */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-[#090e0b]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6">
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
              <h4 className="text-xl font-extrabold text-white">
                {uploadStep === 1 && "Uploading Award Image..."}
                {uploadStep === 2 && "Saving Record..."}
                {uploadStep === 3 && "Honor/Award Added!"}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {uploadStep === 1 && "Uploading photo to CDN..."}
                {uploadStep === 2 && "Syncing with database..."}
                {uploadStep === 3 && "Redirecting to awards list..."}
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

      {/* Main Form Container */}
      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden space-y-6">
        
        {/* Header Section */}
        <div className="p-6 bg-[#121c17]/80 border-b border-emerald-900/40 flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Add Honor or Award</h2>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Recognition
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Highlight your achievements, recognitions, and prestigious awards.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Title / Honor Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dean's Award 2023 / Champion - National Hackathon"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.title ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("title", { required: "Honor / Award title is required" })}
              />
              {errors.title && (
                <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Issuer Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" /> Issuer / Organization <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. University of Dhaka / ICT Division"
                className={`w-full px-4 py-3 bg-[#121c17]/80 border ${
                  errors.issuer ? "border-rose-500" : "border-emerald-500/20"
                } rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner`}
                {...register("issuer", { required: "Issuer name is required" })}
              />
              {errors.issuer && (
                <p className="text-xs text-rose-400 mt-1">{errors.issuer.message}</p>
              )}
            </div>

            {/* Associated With */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" /> Associated With
              </label>
              <input
                type="text"
                placeholder="e.g. Bachelor's Degree / Software Engineer Role"
                className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
                {...register("associatedWith")}
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" /> Issue Date
              </label>
              <input
                type="text"
                placeholder="e.g. December 2023 or 12/2023"
                className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
                {...register("issueDate")}
              />
            </div>

            {/* Verification Link */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-amber-400" /> Verification / Certificate Link
              </label>
              <input
                type="url"
                placeholder="e.g. https://example.com/award/123"
                className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition shadow-inner"
                {...register("verificationUrl")}
              />
            </div>
          </div>

          {/* Award Image Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Award Photo / Crest / Certificate Image
            </label>
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-emerald-500/30 bg-[#121c17]/60 hover:border-amber-400/40 transition-all rounded-2xl p-6 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">
                  Click or drag award/certificate photo here
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="relative p-4 bg-[#121c17]/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-14 object-cover rounded-xl border border-emerald-500/20 bg-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[250px]">
                      {selectedImageFile?.name || "Uploaded Award Image"}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Ready to upload</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue("imageFile", null);
                    setImagePreview(null);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Description / Summary
            </label>
            <textarea
              rows="3"
              placeholder="Brief details about the recognition, achievement criteria, position..."
              className="w-full px-4 py-3 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 resize-none transition shadow-inner"
              {...register("description")}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Honor & Award"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHonors;