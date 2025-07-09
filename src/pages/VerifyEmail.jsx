import { useEffect, useRef, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input on mount
    inputRefs.current[0]?.focus();

    if (!localStorage.getItem("otpSent")) {
      resendOtp();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all boxes are filled
    const joinedOtp = newOtp.join("");
    if (joinedOtp.length === 6 && joinedOtp.match(/^\d{6}$/)) {
      submitOtp(joinedOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "Enter") {
      const joinedOtp = otp.join("");
      if (joinedOtp.length === 6) {
        submitOtp(joinedOtp);
      }
    }
  };

  

  const submitOtp = async (otpValue) => {
    setLoading(true);
    try {
      const res = await axios.put("/auth/verify-otp", { otp: otpValue });
      if (res.data.success) {
        toast.success("Email verified!");
        localStorage.removeItem("otpSent");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/auth/send-otp");
      if (res.data.success) {
        toast.success("OTP resent!");
        localStorage.setItem("otpSent", "true");
      } else {
        toast.error(res.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-800/80 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-extrabold mb-4">Verify Your Email</h1>
        <p className="text-gray-400 mb-6">Enter the 6-digit OTP sent to your email</p>

        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-14 text-center text-xl rounded-lg bg-gray-700 border border-purple-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          ))}
        </div>

        <button
          onClick={() => submitOtp(otp.join(""))}
          disabled={loading}
          className="w-full py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-semibold"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          onClick={resendOtp}
          disabled={loading}
          className="mt-4 text-purple-400 hover:text-purple-300 underline text-sm"
        >
          Resend OTP
        </button>

        <p className="mt-6 text-sm text-gray-400">
          <Link to="/login" className="text-purple-400 hover:underline">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
