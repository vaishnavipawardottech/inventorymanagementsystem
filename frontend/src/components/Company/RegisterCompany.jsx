import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../Layout/Button";
import { Building2, Mail, MapPin, Globe2, ChevronDown } from "lucide-react";

function RegisterCompany() {
  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    address: "",
    timezoneFrom: "",
    timezoneTo: "",
    plan: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const plans = ["free", "starter", "enterprise"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPlan = (plan) => {
    setFormData((prev) => ({ ...prev, plan }));
    setIsDropdownOpen(false);
  };

  const handleRegisterCompany = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/v1/register-company", formData, {
        withCredentials: true,
      });
      console.log("Company registered:", res.data);
      setSuccess("Company registered successfully! Check email for OTP.");
      setFormData({
        company_name: "",
        company_email: "",
        address: "",
        timezoneFrom: "",
        timezoneTo: "",
        plan: "",
      });
    navigate("/verify-company")
    } catch (error) {
      console.error("Company registration failed:", error);
      const msg =
        error.response?.data?.message || "Failed to register company.";
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        className="bg-white min-w-[400px] w-full p-9 rounded-2xl shadow-xl"
        onSubmit={handleRegisterCompany}
      >
        <div className="flex flex-col items-center w-full">
          <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
            Register Company
          </h2>

          {/* Company Name */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            <Building2 className="w-5 h-5 mr-2 text-gray-500" />
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Company Email */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            <Mail className="w-5 h-5 mr-2 text-gray-500" />
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="email"
              name="company_email"
              placeholder="Company Email"
              value={formData.company_email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Timezone From */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            {/* <Globe2 className="w-5 h-5 mr-2 text-gray-500" /> */}
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="text"
              name="timezoneFrom"
              placeholder="Timezone From (e.g. 10 AM)"
              value={formData.timezoneFrom}
              onChange={handleChange}
            />
          </div>

          {/* Timezone To */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            {/* <Globe2 className="w-5 h-5 mr-2 text-gray-500" /> */}
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="text"
              name="timezoneTo"
              placeholder="Timezone To (e.g. 5 PM)"
              value={formData.timezoneTo}
              onChange={handleChange}
            />
          </div>

          {/* Plan Dropdown */}
          <div className="relative w-full mb-4">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between bg-blue-100 text-gray-700 p-3 rounded-lg cursor-pointer hover:bg-blue-200 transition"
            >
              <div className="flex items-center">
                <span>{formData.plan || "Select Plan"}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 overflow-y-auto">
                {plans.map((plan) => (
                  <div
                    key={plan}
                    onClick={() => handleSelectPlan(plan)}
                    className={`px-4 py-2 text-gray-700 cursor-pointer hover:bg-indigo-100 ${
                      formData.plan === plan ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 text-lg font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
          >
            Register Company
          </Button>

          {/* Error & Success */}
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-3">{success}</p>}

          {/* Back to login */}
          {/* <p className="text-gray-600 text-sm mt-6 text-center">
            Already registered company?{" "}
            <a href="/login" className="text-indigo-700 underline ml-1">
              Login
            </a>
          </p> */}
        </div>
      </form>
    </div>
  );
}

export default RegisterCompany;
