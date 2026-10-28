import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 max-w-md text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 font-[#Playfair_Display]">
          Access Denied
        </h1>
        <p className="text-sm text-gray-500">
          Sorry, you do not have administrative privileges to access this area.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#163A2D] text-amber-300 rounded-xl font-medium text-sm hover:bg-[#0C2219] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back to Login
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;