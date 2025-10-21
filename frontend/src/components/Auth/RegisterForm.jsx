import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../Layout/Button";
import { User, Mail, LockKeyholeOpen, Building2, ChevronDown, Briefcase } from "lucide-react";

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    isCompanyMember: false,
    companyName: "",
  });

  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false); // New state for Role dropdown
  const navigate = useNavigate();

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("/api/v1/companies", { withCredentials: true });
        setCompanies(res.data.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectCompany = (companyName) => {
    setFormData((prev) => ({ ...prev, companyName }));
    setIsDropdownOpen(false);
  };

  const handleSelectRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setIsRoleDropdownOpen(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/v1/register", formData, { withCredentials: true });
      console.log("Registration successful:", res.data);
      setSuccess("User registered successfully");
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "",
        isCompanyMember: false,
        companyName: "",
      });
      navigate("/login");
    } catch (error) {
      console.log("Registration failed:", error);
      const errormsg = error.response?.data?.message || "Registration failed";
      setError(errormsg);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        className="bg-white min-w-[400px] w-full p-9 rounded-2xl shadow-xl"
        onSubmit={handleRegister}
      >
        <div className="flex flex-col items-center w-full">
          <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">Register</h2>

          {/* Username */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            <Mail className="w-5 h-5 mr-2 text-gray-500" />
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full">
            <LockKeyholeOpen className="w-5 h-5 mr-2 text-gray-500" />
            <input
              className="bg-blue-100 text-gray-700 w-full outline-none"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative w-full mb-4">
            <div
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center justify-between bg-blue-100 text-gray-700 p-3 rounded-lg cursor-pointer hover:bg-blue-200 transition"
            >
              <div className="flex items-center">
                {/* <Briefcase className="w-5 h-5 mr-2 text-gray-500" /> */}
                <span>{formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : "Select Role"}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transform transition-transform ${
                  isRoleDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isRoleDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 overflow-y-auto max-h-48">
                {["admin", "staff"].map((roleOption) => (
                  <div
                    key={roleOption}
                    onClick={() => handleSelectRole(roleOption)}
                    className={`px-4 py-2 text-gray-700 cursor-pointer hover:bg-indigo-100 ${
                      formData.role === roleOption ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company Membership Checkbox */}
          <div className="flex items-center justify-between w-full mb-4 ml-1">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                name="isCompanyMember"
                checked={formData.isCompanyMember}
                onChange={handleChange}
                className="w-4 h-4 accent-indigo-600"
              />
              <span>Are you a member of any company?</span>
            </label>
          </div>

          {/* Company Dropdown */}
          {formData.isCompanyMember && (
            <div className="relative w-full mb-4">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between bg-blue-100 text-gray-700 p-3 rounded-lg cursor-pointer hover:bg-blue-200 transition"
              >
                <div className="flex items-center">
                  {/* <Building2 className="w-5 h-5 mr-2 text-gray-500" /> */}
                  <span>{formData.companyName || "Select Company"}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transform transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto">
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => handleSelectCompany(company.company_name)}
                        className={`px-4 py-2 text-gray-700 cursor-pointer hover:bg-indigo-100 ${
                          formData.companyName === company.company_name ? "bg-indigo-50 font-medium" : ""
                        }`}
                      >
                        {company.company_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">No companies found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 text-lg font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
          >
            Register
          </Button>

          {/* Error / Success Messages */}
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-3">{success}</p>}

          {/* Login Link */}
          <p className="text-gray-600 text-sm mt-6 text-center">
            Already registered?
            <a className="text-indigo-700 underline ml-2" href="/login">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
