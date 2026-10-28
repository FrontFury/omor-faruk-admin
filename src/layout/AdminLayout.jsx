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
  Atom
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "../pages/Shared/Navbar";

// Premium Ambient Floating Badges
const ambientFloatingElements = [
  { Icon: Leaf, top: "12%", left: "2%", size: 28, color: "#10B981", delay: 0 },
  { Icon: Atom, top: "42%", left: "2.5%", size: 30, color: "#059669", delay: 1.2 },
  { Icon: Microscope, top: "78%", left: "2%", size: 30, color: "#D97706", delay: 2.4 },

  { Icon: Sparkles, top: "15%", right: "2.5%", size: 26, color: "#D97706", delay: 1.8 },
  { Icon: Compass, top: "48%", right: "2%", size: 28, color: "#10B981", delay: 0.6 },
  { Icon: Leaf, top: "82%", right: "2.5%", size: 28, color: "#047857", delay: 2 },
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
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden">
      
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
            background: "#FFFFFF",
            color: "#0F172A",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          },
        }}
      />

      {/* 1. Subtle Light Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none -z-10" />

      {/* 2. Soft Mint/Emerald Light Glow Spheres */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-emerald-100/70 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-100/60 rounded-full blur-[160px]" />
        <div className="absolute -bottom-24 left-1/3 w-[650px] h-[650px] bg-teal-100/60 rounded-full blur-[160px]" />
      </div>

      {/* 3. Ambient Light Floating Badges */}
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
              className="hidden xl:flex p-3 rounded-2xl bg-white/80 border border-emerald-100/80 shadow-xl shadow-emerald-950/5 items-center justify-center backdrop-blur-xl"
            >
              <ElementIcon
                size={item.size}
                color={item.color}
                style={{ filter: `drop-shadow(0 2px 8px ${item.color}33)` }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* TOP NAVBAR HEADER */}
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/80 shadow-sm transition-all duration-300">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Brand Identity & Title */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="group flex items-center gap-3 text-lg sm:text-xl font-bold tracking-tight hover:opacity-90 transition-all"
            >
              
              <div className="flex flex-col">
                <span className="font-serif tracking-wide text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Md. Mamonur Rashid
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-700 font-bold">
                  Executive Admin Portal
                </span>
              </div>
            </NavLink>
          </div>

          {/* Right Status Controls (Logout Removed) */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Live Clock Indicator */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-xs font-mono text-slate-600 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Admin Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Admin</span>
            </div>

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-2.5 bg-slate-900 text-white rounded-xl border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all lg:hidden cursor-pointer flex items-center justify-center shadow-md"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-amber-400" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation Menu */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Outlet Stage Container */}
      <main className="relative z-10 flex-grow max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:pl-10 lg:pr-24 py-8 transition-all duration-300">
        
        {/* Animated Light Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full bg-white/80 border border-slate-200/90 rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-xl shadow-slate-200/50"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Light Footer Branding Bar */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-[1500px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Md. Mamonur Rashid. All rights reserved.</span>
          <div className="flex items-center gap-2 text-emerald-700 font-sans font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>System Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AdminLayout;