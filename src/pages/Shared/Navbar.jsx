import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  UserStar,
  BookMarked,
  Activity,
  Award,
  Images,
  Contact,
  LogOut,
  FolderPlus,
} from "lucide-react";
import useAuth from "../../hook/useAuth";

const Navbar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  // Router configuration paths
  const navItems = [
    { id: "users", label: "Users", icon: Users, path: "/admin/all-users" },
    
    // Education Routes
    { id: "add-education", label: "Add Education", icon: FolderPlus, path: "/education/add" },
    { id: "all-education", label: "All Education", icon: GraduationCap, path: "/education/all" },
    
    // Experience Routes
    { id: "add-experience", label: "Add Experience", icon: FolderPlus, path: "/experience/add" },
    { id: "all-experience", label: "All Experience", icon: Briefcase, path: "/experience/all" },
    
    // Publications Routes
    { id: "add-publications", label: "Add Publications", icon: FolderPlus, path: "/publications/add" },
    { id: "all-publications", label: "All Publications", icon: BookOpen, path: "/publications/all" },
    
    // Expertise / Skills Routes
    { id: "add-expertise", label: "Add Expertise", icon: FolderPlus, path: "/expertise/add" },
    { id: "all-expertise", label: "All Expertise", icon: UserStar, path: "/expertise/all" },
    
    // Books Routes
    { id: "add-books", label: "Add Books", icon: FolderPlus, path: "/books/add" },
    { id: "all-books", label: "All Books", icon: BookMarked, path: "/books/all" },
    
    // Activities Routes
    { id: "add-activities", label: "Add Activities", icon: FolderPlus, path: "/activities/add" },
    { id: "all-activities", label: "All Activities", icon: Activity, path: "/activities/all" },
    
    // Honors / Awards Routes
    { id: "add-honor", label: "Add Honor", icon: FolderPlus, path: "/honor/add" },
    { id: "all-honor", label: "All Honor", icon: Award, path: "/honor/all" },
    
    // Gallery Routes
    { id: "add-gallery", label: "Add Gallery", icon: FolderPlus, path: "/gallery/add" },
    { id: "all-gallery", label: "All Gallery", icon: Images, path: "/gallery/all" },
    
    // Referees Routes
    { id: "add-referees", label: "Add Referees", icon: FolderPlus, path: "/referees/add" },
    { id: "all-referees", label: "All Referees", icon: Contact, path: "/referees/all" },
  ];

  const onLogoutClick = async () => {
    setIsOpen(false);
    try {
      queryClient.clear();
      if (logout) {
        await logout();
      }
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#090e0b]/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDE NAVIGATION WRAPPER */}
      <aside
        className={`
          fixed z-50 transition-all duration-300 ease-in-out
          top-20 right-4 left-4 flex flex-col p-2.5 sm:p-3
          bg-[#0d1410]/95 backdrop-blur-2xl rounded-3xl shadow-2xl gap-1
          max-h-[78vh] overflow-y-auto

          /* LARGE SCREEN ADJUSTMENTS */
          lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-3 lg:w-auto lg:items-end lg:gap-1 lg:bg-[#0d1410]/80 lg:p-2 lg:shadow-2xl lg:backdrop-blur-xl
          lg:max-h-[calc(100vh-6rem)] lg:pr-2 lg:py-2.5

          /* Scrollbar Customizations */
          [scrollbar-width:thin] [scrollbar-color:#f59e0b22_transparent]
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-400/20 [&::-webkit-scrollbar-thumb]:rounded-full

          ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none lg:opacity-100 lg:scale-100 lg:pointer-events-auto"
          }
        `}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                group relative flex items-center transition-all duration-200 ease-in-out w-full lg:w-auto

                ${
                  isActive
                    ? `bg-gradient-to-r from-emerald-900 to-[#0d1410] text-amber-300 font-bold px-3 py-1.5 lg:py-1.5 lg:px-2.5 rounded-xl shadow-md shadow-emerald-950/40 justify-start lg:justify-center`
                    : `text-slate-300 hover:text-white hover:bg-emerald-950/60 p-2 lg:p-1.5 lg:px-2.5 rounded-xl lg:bg-[#121c17]/60 lg:backdrop-blur-md justify-start lg:justify-center`
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-amber-400 stroke-[2.5]" : "text-emerald-400/80 group-hover:text-amber-300 stroke-2"
                    }`}
                  />

                  {/* Responsive Label */}
                  <span
                    className={`ml-2.5 text-xs whitespace-nowrap tracking-wide font-medium ${
                      isActive ? "inline-block text-amber-300 font-extrabold" : "inline-block lg:hidden text-slate-200"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Desktop Hover Tooltip */}
                  {!isActive && (
                    <span className="hidden lg:block absolute right-11 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-[#0d1410] text-amber-300 text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-2xl">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* LOGOUT BUTTON */}
        <button
          onClick={onLogoutClick}
          className="group relative flex items-center transition-all duration-200 ease-in-out w-full lg:w-auto p-2 lg:p-1.5 lg:px-2.5 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 lg:bg-[#121c17]/60 lg:backdrop-blur-md justify-start lg:justify-center cursor-pointer mt-1"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400 stroke-2 group-hover:text-rose-300 transition-colors" />

          <span className="ml-2.5 text-xs whitespace-nowrap tracking-wide font-bold text-rose-400 inline-block lg:hidden">
            Logout
          </span>

          <span className="hidden lg:block absolute right-11 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-rose-950 text-rose-200 text-[11px] font-extrabold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-2xl">
            Logout
          </span>
        </button>
      </aside>
    </>
  );
};

export default Navbar;