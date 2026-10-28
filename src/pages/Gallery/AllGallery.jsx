import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hook/useAxiosSecure";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Image as ImageIcon,
  Calendar,
  Edit3,
  Trash2,
  X,
  Upload,
  CloudUpload,
  Database,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

/* --- EDIT GALLERY MODAL COMPONENT --- */
const EditGalleryModal = ({ record, onClose }) => {
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
      title: record.title || "",
      category: record.category || "",
      date: record.date || "",
      description: record.description || "",
      imageFile: null,
    },
  });

  const selectedImageFile = watch("imageFile");

  const { mutateAsync: updateGalleryItem } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.patch(`/gallery/${record._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setUploadStep(3);
      setUploadProgress(100);
      toast.success("Gallery item updated successfully! 📝");

      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err) => {
      console.error("Update Error:", err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to update item.");
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
      let imageUrl = record.image;

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
            body: imgData 
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
        title: data.title,
        category: data.category,
        date: data.date,
        description: data.description,
        image: imageUrl,
      };

      await updateGalleryItem(payload);
    } catch (err) {
      console.error(err);
      setUploadStep(0);
      setUploadProgress(0);
      toast.error(err.message || "An error occurred!");
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
              {uploadStep === 1 && "Uploading new image..."}
              {uploadStep === 2 && "Saving updates..."}
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

      {/* Modal Container */}
      <div className="bg-[#0d1410] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-400/30 overflow-hidden relative my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#121c17]/80 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/30 text-amber-400 rounded-2xl shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Edit Gallery Photo</h2>
              <p className="text-xs text-slate-400 font-medium">Update caption, category, or replace photo.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Title / Caption *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("category")}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60"
                {...register("date")}
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Gallery Image</label>
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-emerald-500/30 bg-[#121c17]/60 rounded-2xl p-4 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-300 font-semibold">Click to upload new image</p>
              </div>
            ) : (
              <div className="relative p-3 bg-[#121c17]/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Thumbnail" className="w-16 h-12 object-cover rounded-xl border border-emerald-500/20 bg-white/10" />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {selectedImageFile ? selectedImageFile.name : "Current Image"}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium">Ready to update</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setValue("imageFile", null); setImagePreview(null); }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
            <textarea
              rows="3"
              className="w-full px-4 py-2.5 bg-[#121c17] border border-emerald-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/60 resize-none"
              {...register("description")}
            ></textarea>
          </div>

          {/* Actions */}
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


/* --- MAIN ALL GALLERY COMPONENT --- */
const AllGallery = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);

  // Fetch Gallery Items
  const { data: galleryItems = [], isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const res = await axiosSecure.get("/gallery");
      return res.data;
    },
  });

  // Delete Gallery Item Mutation
  const { mutateAsync: deleteGalleryItem } = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/gallery/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Gallery item deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete.");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this gallery item!",
      icon: "warning",
      showCancelButton: true,
      background: "#0d1410",
      color: "#ffffff",
      confirmButtonColor: "#fbbf24",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "<span style='color: #090e0b; font-weight: bold;'>Yes, delete it!</span>",
      customClass: {
        popup: "border border-amber-400/30 rounded-3xl",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteGalleryItem(id);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 bg-[#0d1410]/80 rounded-3xl border border-amber-400/20">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs font-mono text-emerald-300">Loading gallery photos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Photo Gallery</h2>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                {galleryItems.length} Photos
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage all photos and media items displayed in your portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      {galleryItems.length === 0 ? (
        <div className="bg-[#0d1410]/80 p-12 text-center rounded-3xl border border-amber-400/20">
          <ImageIcon className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
          <p className="text-sm font-extrabold text-white">No photos added in gallery yet.</p>
          <p className="text-xs text-slate-400 mt-1">Upload your first photo to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item._id}
              className="bg-[#0a110d]/90 rounded-3xl border border-emerald-900/60 shadow-2xl backdrop-blur-xl hover:border-amber-400/40 transition-all overflow-hidden flex flex-col justify-between group relative"
            >
              <div>
                {/* Photo Header */}
                {item.image && (
                  <div className="h-48 w-full bg-[#121c17] overflow-hidden border-b border-emerald-900/40 relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-[#0d1410]/80 border border-amber-400/30 backdrop-blur-md text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {item.date && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 pt-1 bg-[#121c17]/60 p-2.5 rounded-xl border border-emerald-500/10 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-[#121c17]/80 border-t border-emerald-900/40 flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedGalleryItem(item)}
                    className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-900/80 text-amber-300 transition-all cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Edit Modal */}
      {selectedGalleryItem && (
        <EditGalleryModal
          record={selectedGalleryItem}
          onClose={() => setSelectedGalleryItem(null)}
        />
      )}
    </div>
  );
};

export default AllGallery;