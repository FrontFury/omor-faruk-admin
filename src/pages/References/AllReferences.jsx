import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hook/useAxiosSecure";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Users,
  Phone,
  Mail,
  Edit3,
  Trash2,
  X,
  Upload,
  CloudUpload,
  Database,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* --- EDIT REFERENCE MODAL COMPONENT --- */
const EditReferenceModal = ({ record, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [imagePreview, setImagePreview] = useState(record.image || null);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: record.name || "",
      designation: record.designation || "",
      organization: record.organization || "",
      phone: record.phone || "",
      email: record.email || "",
      imageFile: null,
    },
  });

  const selectedImageFile = watch("imageFile");

  const { mutateAsync: updateReferenceItem } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.patch(`/references/${record._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Reference updated successfully! 📝");

      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err) => {
      console.error("Update Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to update reference.");
    },
  });

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setValue("imageFile", file, { shouldValidate: true });
      if (imagePreview && imagePreview !== record.image) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file!");
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = record.image || "";

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

      await updateReferenceItem(payload);
    } catch (err) {
      console.error(err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.message || "An error occurred!");
    }
  };

  const isUpdating = uploadStep > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#163A2D]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {isUpdating && (
        <div className="absolute inset-0 z-[60] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-[#163A2D] text-amber-300 rounded-full flex items-center justify-center shadow-lg">
            {uploadStep === 1 && <CloudUpload className="w-8 h-8 animate-bounce" />}
            {uploadStep === 2 && <Database className="w-8 h-8 animate-pulse" />}
            {uploadStep === 3 && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#163A2D]">
              {uploadStep === 1 && "Uploading new image..."}
              {uploadStep === 2 && "Saving updates..."}
              {uploadStep === 3 && "Updated Successfully!"}
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

      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-8">
        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#163A2D] text-amber-300 rounded-xl shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#163A2D]">Edit Reference</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Designation *</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                {...register("designation", { required: "Designation is required" })}
              />
              {errors.designation && <p className="text-xs text-rose-500 mt-1">{errors.designation.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Organization *</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                {...register("organization", { required: "Organization is required" })}
              />
              {errors.organization && <p className="text-xs text-rose-500 mt-1">{errors.organization.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                {...register("phone")}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                {...register("email")}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Photo</label>
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-emerald-300 bg-gray-50 rounded-2xl p-4 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-semibold">Click to upload photo</p>
              </div>
            ) : (
              <div className="relative p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Thumbnail" className="w-12 h-12 object-cover rounded-full border border-emerald-200" />
                  <div>
                    <p className="text-xs font-bold text-[#163A2D] truncate max-w-[200px]">
                      {selectedImageFile ? selectedImageFile.name : "Current Photo"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">Ready to update</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setValue("imageFile", null); setImagePreview(null); }}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-[#163A2D] hover:bg-[#0C2219] text-amber-300 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/* --- MAIN ALL REFERENCES COMPONENT --- */
const AllReferences = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [selectedReference, setSelectedReference] = useState(null);

  // Fetch Reference Items
  const { data: references = [], isLoading } = useQuery({
    queryKey: ["references"],
    queryFn: async () => {
      const res = await axiosSecure.get("/references");
      return res.data;
    },
  });

  // Delete Reference Item Mutation
  const { mutateAsync: deleteReferenceItem } = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/references/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
      toast.success("Reference deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete.");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this reference!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#163A2D",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteReferenceItem(id);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#163A2D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#163A2D]">References</h2>
          <p className="text-xs text-gray-500">Manage all professional & academic references</p>
        </div>
      </div>

      {references.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No references added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {references.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Profile Header Block */}
                <div className="flex items-start gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-emerald-100 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#163A2D] text-amber-300 flex items-center justify-center font-bold text-xl shrink-0">
                      {item.name?.charAt(0) || "R"}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-[#163A2D] leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-700 mt-1">
                      {item.designation}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {item.organization}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Contact Information (Card Style matching UI) */}
                <div className="space-y-2 pt-1">
                  {item.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{item.phone}</span>
                    </div>
                  )}

                  {item.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {item.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedReference(item)}
                  className="p-2 text-gray-600 hover:text-[#163A2D] bg-gray-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm"
                  title="Edit Reference"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-rose-500 hover:text-rose-700 bg-gray-50 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                  title="Delete Reference"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Edit Modal */}
      {selectedReference && (
        <EditReferenceModal
          record={selectedReference}
          onClose={() => setSelectedReference(null)}
        />
      )}
    </div>
  );
};

export default AllReferences;