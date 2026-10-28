import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hook/useAxiosSecure"; 
import { 
  Users as UsersIcon, 
  Trash2, 
  Search, 
  ShieldCheck, 
  User, 
  Loader2,
  Calendar,
  Mail,
  Fingerprint,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

const AllUsers = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // 1. READ: Fetch Users Data
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });

  // 2. UPDATE ROLE MUTATION (Backend Endpoint: PATCH /users/:id/role)
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await axiosSecure.patch(`/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      toast.success(data?.message || "User role updated successfully!");
    },
    onError: (error) => {
      console.error("Role update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update user role");
    },
  });

  // 3. DELETE USER MUTATION
  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    },
  });

  // Role Change Handler
  const handleRoleChange = (user, newRole) => {
    const mongoId = user._id;

    if (!mongoId) {
      toast.error("User Mongo _id standard not found!");
      return;
    }

    updateRoleMutation.mutate({
      id: mongoId,
      role: newRole,
    });
  };

  // Delete Action Handler
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  // Search & Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ? true : user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1410]/80 p-6 rounded-3xl border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-amber-400 shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">User Management</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Access Control
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage all system accounts, update roles & permissions in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121c17]/80 border border-emerald-500/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-all shadow-inner"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121c17]/90 border border-emerald-500/20 rounded-2xl w-full sm:w-auto">
          {["all", "admin", "user"].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                filterRole === role
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white hover:bg-emerald-950/40"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-mono text-emerald-300">Loading users data...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-400 text-xs font-mono">
            Failed to load users data from server.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            No users found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              
              {/* Table Header */}
              <thead className="bg-[#121c17]/90 border-b border-emerald-900/40 text-emerald-300 uppercase font-mono text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">UID</th>
                  <th className="px-6 py-4">Role Update</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-emerald-900/30 font-sans">
                {filteredUsers.map((u) => (
                  <tr key={u._id || u.uid} className="hover:bg-emerald-950/30 transition-colors">
                    
                    {/* Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white truncate">{u.name || "N/A"}</span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1.5 truncate mt-0.5">
                            <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* UID */}
                    <td className="px-6 py-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 bg-[#121c17]/80 px-2.5 py-1 rounded-lg w-fit border border-emerald-500/20 text-[11px]">
                        <Fingerprint className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{u.uid}</span>
                      </div>
                    </td>

                    {/* Role Direct Update Dropdown */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === "admin" ? (
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        
                        <select
                          value={u.role || "user"}
                          disabled={updateRoleMutation.isPending}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs border cursor-pointer focus:outline-none transition-all ${
                            u.role === "admin"
                              ? "bg-amber-400 text-slate-950 border-amber-400 focus:border-amber-300"
                              : "bg-[#121c17]/90 text-slate-200 border-emerald-500/30 focus:border-amber-400/60"
                          }`}
                        >
                          <option value="user" className="bg-[#0d1410] text-white">User</option>
                          <option value="admin" className="bg-[#0d1410] text-amber-300 font-bold">Admin</option>
                        </select>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </td>

                    {/* Delete Action Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u._id || u.uid, u.name)}
                        className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-all cursor-pointer shadow-md"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AllUsers;