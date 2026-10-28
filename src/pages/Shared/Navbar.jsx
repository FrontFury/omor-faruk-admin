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

  // Router configuration paths exact sync kora hoyeche
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
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* SIDE NAVIGATION */}
      <aside
        className={`
          fixed z-50 transition-all duration-300 ease-in-out
          top-20 right-4 left-4 flex flex-col p-3
          bg-white/90 backdrop-blur-2xl border border-emerald-100/90 rounded-3xl shadow-2xl shadow-emerald-950/10 gap-1.5 
          max-h-[75vh] overflow-y-auto

          /* LARGE SCREEN ADJUSTMENTS */
          lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-4 lg:w-auto lg:items-end lg:gap-1.5 lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none lg:backdrop-blur-none 
          lg:max-h-[calc(100vh-2rem)] lg:pr-1 lg:py-2
          
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden

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
                    ? `bg-gradient-to-r from-emerald-800 to-[#163A2D] text-amber-300 font-semibold px-3.5 py-2 lg:py-2 lg:px-3.5 rounded-2xl border border-emerald-700/50 shadow-lg shadow-emerald-900/20 justify-start lg:justify-center`
                    : `text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/80 p-2.5 lg:p-2 lg:px-3 rounded-2xl lg:bg-white/80 lg:border lg:border-slate-200/80 lg:backdrop-blur-xl lg:shadow-sm justify-start lg:justify-center`
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] shrink-0 transition-colors duration-200 ${
                      isActive ? "text-amber-400 stroke-[2.5]" : "text-slate-600 group-hover:text-emerald-700 stroke-2"
                    }`}
                  />

                  {/* Responsive Label */}
                  <span
                    className={`ml-3 text-sm whitespace-nowrap tracking-wide font-medium ${
                      isActive ? "inline-block text-amber-300 font-bold" : "inline-block lg:hidden text-slate-800"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Desktop Hover Tooltip */}
                  {!isActive && (
                    <span className="hidden lg:block absolute right-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-[#163A2D] text-amber-300 text-xs py-1.5 px-3 rounded-xl border border-emerald-700/50 whitespace-nowrap shadow-xl font-medium">
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
          className="group relative flex items-center transition-all duration-200 ease-in-out w-full lg:w-auto p-2.5 lg:p-2 lg:px-3 rounded-2xl text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 lg:bg-white/80 lg:border lg:border-slate-200/80 lg:backdrop-blur-xl lg:shadow-sm justify-start lg:justify-center cursor-pointer mt-1"
        >
          <LogOut className="w-4 h-4 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] shrink-0 text-rose-500 stroke-2 group-hover:text-rose-600 transition-colors" />

          <span className="ml-3 text-sm whitespace-nowrap tracking-wide font-bold text-rose-600 inline-block lg:hidden">
            Logout
          </span>

          <span className="hidden lg:block absolute right-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-rose-950 text-rose-200 text-xs py-1.5 px-3 rounded-xl border border-rose-800/50 whitespace-nowrap shadow-xl font-semibold">
            Logout
          </span>
        </button>
      </aside>
    </>
  );
};

export default Navbar;