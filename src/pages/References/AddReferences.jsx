import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hook/useAxiosSecure";
import toast from "react-hot-toast";
import {
  UserPlus,
  User,
  Briefcase,
  Building,
  Phone,
  Mail,
  Upload,
  CloudUpload,
  Database,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

const AddReferences = () => {
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
      name: "",
      designation: "",
      organization: "",
      phone: "",
      email: "",
      imageFile: null,
    },
  });

  const selectedImageFile = watch("imageFile");

  const { mutateAsync: addReferenceItem } = useMutation({
    mutationFn: async (newItem) => {
      const res = await axiosSecure.post("/references", newItem);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Reference added successfully! 👤");

      setTimeout(() => {
        setUploadStep(0);
        setUploadProgress(0);
        reset();
        setImagePreview(null);
        navigate("/referees/all");
      }, 1200);
    },
    onError: (err) => {
      console.error("Add Reference Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to add reference.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("imageFile", file, { shouldValidate: true });
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
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

        const apiKey = import.meta.env.VITE_image_host_key;
        if (!apiKey) {
          throw new Error("ImgBB API Key (VITE_image_host_key) is missing in .env file!");
        }

        const imgBbRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          {
            method: "POST",
            body: imgData,
          }
        );

        const imgBbResult = await imgBbRes.json();

        if (!imgBbRes.ok || !imgBbResult.success) {
          console.error("ImgBB Upload Failure Details:", imgBbResult);
          throw new Error(imgBbResult?.error?.message || "ImgBB Image upload failed!");
        }

        imageUrl = imgBbResult.data.display_url;
      }

      setUploadStep(2);
      setUploadProgress(75);

      const payload = {
        name: data.name,
        designation: data.designation,
        organization: data.organization,
        phone: data.phone,
        email: data.email,
        image: imageUrl,
      };

      await addReferenceItem(payload);
    } catch (err) {
      console.error("Submit Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.message || "An error occurred while saving!");
    }
  };

  const isUploading = uploadStep > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 relative">
      {/* Uploading Status Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-[#163A2D] text-amber-300 rounded-full flex items-center justify-center shadow-lg">
            {uploadStep === 1 && <CloudUpload className="w-8 h-8 animate-bounce" />}
            {uploadStep === 2 && <Database className="w-8 h-8 animate-pulse" />}
            {uploadStep === 3 && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#163A2D]">
              {uploadStep === 1 && "Uploading Reference Image..."}
              {uploadStep === 2 && "Saving Reference Data..."}
              {uploadStep === 3 && "Reference Added Successfully!"}
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
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#163A2D]">Add New Reference</h2>
            <p className="text-xs text-emerald-800 font-medium">
              Add professional or academic reference details
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" /> Name / Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Prof. Dr. Mohammed Shakhawat Hossain"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-700" /> Designation *
              </label>
              <input
                type="text"
                placeholder="e.g. Principal & Executive Director"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("designation", { required: "Designation is required" })}
              />
              {errors.designation && (
                <p className="text-xs text-rose-500 mt-1">{errors.designation.message}</p>
              )}
            </div>

            {/* Organization / Institution */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-700" /> Organization / Group *
              </label>
              <input
                type="text"
                placeholder="e.g. Daffodil Group / Daffodil Institute of IT (DIIT)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("organization", { required: "Organization is required" })}
              />
              {errors.organization && (
                <p className="text-xs text-rose-500 mt-1">{errors.organization.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 01713493160"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("phone")}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-700" /> Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. nup.principal@diit.info"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all"
                {...register("email")}
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Profile Photo (Optional)
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
                  Click or drag reference photo here
                </p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="relative p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-full border border-emerald-200 shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#163A2D] truncate max-w-[250px]">
                      {selectedImageFile?.name || "Selected Photo"}
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

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-3 bg-[#163A2D] hover:bg-[#0C2219] text-amber-300 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-70 transition-all shadow-md"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Reference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReferences;