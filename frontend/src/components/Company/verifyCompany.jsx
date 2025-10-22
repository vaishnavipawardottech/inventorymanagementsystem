import React, { useState } from "react";
import axios from "axios";
import { ShieldCheck, Loader2, Mail, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

function VerifyCompany() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_email: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "/api/v1/verify",
        formData,
        { withCredentials: true }
      );

      setMessage(res.data.message || "Company verified successfully!");
      setTimeout(() => {
        navigate("/login"); // redirect after success (you can change route)
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="text-indigo-600 w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Company</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enter the OTP sent to your company’s registered email address.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="email"
                name="company_email"
                value={formData.company_email}
                onChange={handleChange}
                placeholder="Enter company email"
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <KeyRound className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full outline-none text-gray-700 tracking-widest"
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Verifying...
              </>
            ) : (
              "Verify Company"
            )}
          </button>
        </form>

        {/* Messages */}
        {message && (
          <p className="mt-4 text-green-600 text-center font-medium">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-red-500 text-center font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

export default VerifyCompany;
