import { useState } from "react";
import { Sparkles, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuth from "../../hook/useAuth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const { signInUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // 1. Authenticate user
      await signInUser(data.email, data.password);

      // 2. Dynamic Redirection (Protected route e jawar cesta korle sethane jabe, nahoy Root "/" e jabe)
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });

    } catch (error) {
      console.error("Login Error:", error);

      // Firebase status message mapping
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setServerError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setServerError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setServerError("Too many attempts. Please try again later.");
      } else {
        setServerError(error?.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-slate-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Scholar Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Enter your academic credentials to access your portal.
          </p>
        </div>

        {/* Global Server Error Message */}
        {serverError && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center font-medium">
            {serverError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. s.ahmed@student.diit.info"
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-400 focus:ring-red-500/10 focus:border-red-400"
                    : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-[11px] text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <a
                href="#forgot-password"
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...register("password", {
                  required: "Password is required",
                })}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-400 focus:ring-red-500/10 focus:border-red-400"
                    : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-[11px] text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:opacity-70 text-white font-bold text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2 group mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <LogIn className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="font-bold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1 transition-colors"
            >
              Create Account <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;