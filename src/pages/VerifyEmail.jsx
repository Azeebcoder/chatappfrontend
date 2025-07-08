import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField.jsx";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const alreadySent = localStorage.getItem("otpSent");

    if (!alreadySent) {
      const sendOtpOnLoad = async () => {
        setLoading(true);
        try {
          const res = await axios.get("/auth/send-otp");
          if (res.data.success) {
            toast.success("OTP sent to your email.");
            localStorage.setItem("otpSent", "true");
          } else {
            toast.error(res.data.message || "Failed to send OTP");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error sending OTP");
        } finally {
          setLoading(false);
        }
      };

      sendOtpOnLoad();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("/auth/verify-otp", { otp });
      if (res.data.success) {
        toast.success(res.data.message || "Email verified!");
        localStorage.removeItem("otpSent"); // Clean up after success
        navigate("/login");
      } else {
        toast.error(res.data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/auth/send-otp");
      if (res.data.success) {
        toast.success(res.data.message || "OTP resent!");
        localStorage.setItem("otpSent", "true"); // Update status
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        <button
          onClick={resendOTP}
          disabled={loading}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Resend OTP
        </button>
        <p className="mt-6 text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
