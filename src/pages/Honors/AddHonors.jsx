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
  Link,
  Upload,
  CloudUpload,
  Database,
  CheckCircle2,
  Loader2,
  X,
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
        navigate("/awards/all");
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 relative">
      {/* Status Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-[#163A2D] text-amber-300 rounded-full flex items-center justify-center shadow-lg">
            {uploadStep === 1 && <CloudUpload className="w-8 h-8 animate-bounce" />}
            {uploadStep === 2 && <Database className="w-8 h-8 animate-pulse" />}
            {uploadStep === 3 && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#163A2D]">
              {uploadStep === 1 && "Uploading Award Image..."}
              {uploadStep === 2 && "Saving Record..."}
              {uploadStep === 3 && "Honor/Award Added Successfully!"}
            </h4>
          </div>
          <div className="w-64 bg-gray-100 rounded-full h-2.5 overflow-hidden border border-emerald-100">
            <div
              className="bg-gradient-to-r from-[#163A2D] to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-3">
          <div className="p-3 bg-[#163A2D] text-amber-300 rounded-2xl shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#163A2D]">Add Honor or Award</h2>
            <p className="text-xs text-emerald-800 font-medium">
              Highlight your achievements, recognitions, and awards
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" /> Title / Honor Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Dean's Award 2023 / Champion - National Hackathon"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("title", { required: "Honor / Award title is required" })}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Issuer Organization */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" /> Issuer / Organization *
              </label>
              <input
                type="text"
                placeholder="e.g. University of Dhaka / ICT Division"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("issuer", { required: "Issuer name is required" })}
              />
              {errors.issuer && (
                <p className="text-xs text-rose-500 mt-1">{errors.issuer.message}</p>
              )}
            </div>

            {/* Associated With (Workplace / University / Academic) */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" /> Associated With
              </label>
              <input
                type="text"
                placeholder="e.g. Bachelor's Degree / Software Engineer Role"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("associatedWith")}
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" /> Issue Date
              </label>
              <input
                type="text"
                placeholder="e.g. December 2023 or 12/2023"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("issueDate")}
              />
            </div>

            {/* Verification Link */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-emerald-700" /> Verification / Certificate Link
              </label>
              <input
                type="url"
                placeholder="e.g. https://example.com/award/123"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("verificationUrl")}
              />
            </div>
          </div>

          {/* Award Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Award Photo / Crest / Certificate Image
            </label>
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-emerald-300 bg-gray-50 hover:bg-emerald-50/20 transition-all rounded-2xl p-6 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-semibold">
                  Click or drag award/certificate photo here
                </p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="relative p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-14 object-cover rounded-xl border border-emerald-200 shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#163A2D] truncate max-w-[250px]">
                      {selectedImageFile?.name || "Uploaded Award Image"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">Ready to upload</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue("imageFile", null);
                    setImagePreview(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Description / Summary
            </label>
            <textarea
              rows="3"
              placeholder="Brief details about the recognition, achievement criteria, position..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 resize-none transition-all"
              {...register("description")}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-3 bg-[#163A2D] hover:bg-[#0C2219] text-amber-300 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-70 transition-all shadow-md"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Honor & Award"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHonors;