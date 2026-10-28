import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, 
  Sparkles, 
  Microscope, 
  Menu, 
  X, 
  ShieldCheck, 
  Clock, 
  Compass, 
  Atom,
  GraduationCap
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "../pages/Shared/Navbar";

// Premium Ambient Floating Badges matching the Dark Emerald Theme
const ambientFloatingElements = [
  { Icon: Leaf, top: "12%", left: "2%", size: 28, color: "#10B981", delay: 0 },
  { Icon: Atom, top: "42%", left: "2.5%", size: 30, color: "#059669", delay: 1.2 },
  { Icon: GraduationCap, top: "78%", left: "2%", size: 30, color: "#F59E0B", delay: 2.4 },

  { Icon: Sparkles, top: "15%", right: "2.5%", size: 26, color: "#F59E0B", delay: 1.8 },
  { Icon: Compass, top: "48%", right: "2%", size: 28, color: "#10B981", delay: 0.6 },
  { Icon: Microscope, top: "82%", right: "2.5%", size: 28, color: "#047857", delay: 2 },
];

export const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live Time Clock Tracker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#090e0b] text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">
      
      {/* Toast Notification Container */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        containerStyle={{
          top: 24,
          zIndex: 99999,
        }}
        toastOptions={{
          style: {
            background: "#0d1410",
            color: "#F8FAFC",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          },
        }}
      />

      {/* 1. Subtle Dark Emerald Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none -z-10" />

      {/* 2. Soft Emerald & Gold Ambient Glow Spheres */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-24 left-1/3 w-[650px] h-[650px] bg-teal-900/20 rounded-full blur-[160px]" />
      </div>

      {/* 3. Ambient Floating Badges */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {ambientFloatingElements.map((item, idx) => {
          const ElementIcon = item.Icon;
          return (
            <motion.div
              key={idx}
              initial={{ y: 0, opacity: 0.3 }}
              animate={{
                y: [-14, 14, -14],
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 7 + (idx % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
              style={{
                position: "absolute",
                top: item.top,
                left: item.left,
                right: item.right,
              }}
              className="hidden xl:flex p-3 rounded-2xl bg-[#0d1410]/80 border border-emerald-500/20 shadow-xl shadow-emerald-950/20 items-center justify-center backdrop-blur-xl"
            >
              <ElementIcon
                size={item.size}
                color={item.color}
                style={{ filter: `drop-shadow(0 2px 8px ${item.color}44)` }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* TOP NAVBAR HEADER */}
      <header className="sticky top-0 z-30 w-full bg-[#0d1410]/80 backdrop-blur-xl border-b border-emerald-900/40 shadow-xl transition-all duration-300">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Brand Identity & Title */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="group flex items-center gap-3 text-lg sm:text-xl font-bold tracking-tight hover:opacity-90 transition-all"
            >
              <div className="flex flex-col">
                <span className="font-serif tracking-wide text-white group-hover:text-amber-300 transition-colors">
                  Md. Omar Faruk
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  Academic Executive Portal
                </span>
              </div>
            </NavLink>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Live Clock Indicator */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-amber-300 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Admin Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs text-amber-300 font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verified Admin</span>
            </div>

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-2.5 bg-emerald-950/80 text-white rounded-xl border border-emerald-500/30 hover:border-amber-400/40 active:scale-95 transition-all lg:hidden cursor-pointer flex items-center justify-center shadow-md"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-amber-400" />
              ) : (
                <Menu className="w-5 h-5 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation Menu */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Outlet Stage Container */}
      <main className="relative z-10 flex-grow max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:pl-10 lg:pr-24 py-8 transition-all duration-300">
        
        {/* Animated Dark Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full bg-[#0d1410]/80 border border-amber-400/20 rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-2xl"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Dark Footer Branding Bar */}
      <footer className="relative z-10 w-full border-t border-emerald-900/40 bg-[#0d1410]/90 backdrop-blur-md py-4 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-[1500px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Md. Omar Faruk. All rights reserved.</span>
          <div className="flex items-center gap-2 text-amber-300 font-sans font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>System Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AdminLayout;