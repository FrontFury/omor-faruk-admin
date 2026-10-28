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
  Fingerprint
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

  // 2. UPDATE ROLE MUTATION (Apnar backend route: PATCH /users/:id/role)
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      // Backend Endpoint Matching: /users/:id/role
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
    // Mongo DB _id ache kina dekhe neya
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 p-6 rounded-3xl border border-slate-200/80 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif">User Management</h1>
            <p className="text-xs text-slate-500 font-mono">
              Manage all system accounts, update roles & permissions.
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
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl w-full sm:w-auto">
          {["all", "admin", "user"].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filterRole === role
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white/80 border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
            <span className="text-xs font-mono">Loading users data...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 text-xs font-mono">
            Failed to load users data from server.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No users found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase font-mono text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">UID</th>
                  <th className="px-6 py-4">Role Update</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredUsers.map((u) => (
                  <tr key={u._id || u.uid} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-[#163A2D] text-amber-300 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 truncate">{u.name || "N/A"}</span>
                          <span className="text-slate-500 text-[11px] flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* UID */}
                    <td className="px-6 py-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg w-fit border border-slate-200/60 text-[11px]">
                        <Fingerprint className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{u.uid}</span>
                      </div>
                    </td>

                    {/* Role Direct Update Dropdown */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === "admin" ? (
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <User className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        
                        <select
                          value={u.role || "user"}
                          disabled={updateRoleMutation.isPending}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs border cursor-pointer focus:outline-none transition-all ${
                            u.role === "admin"
                              ? "bg-amber-50 text-amber-900 border-amber-300 focus:border-amber-500"
                              : "bg-slate-100 text-slate-700 border-slate-200 focus:border-emerald-500"
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </td>

                    {/* Delete Action Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u._id || u.uid, u.name)}
                        className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-all cursor-pointer shadow-xs"
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