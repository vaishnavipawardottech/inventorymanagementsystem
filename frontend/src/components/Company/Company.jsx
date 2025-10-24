import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Pencil, ChevronRight, X } from "lucide-react";

function Company() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("");
  const [showmsg, setShowmsg] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchMyCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/v1/my-company`, {
        withCredentials: true,
      });

      setCompany(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch company info");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/v1/profile`, {
        withCredentials: true,
      });
      setRole(res.data.data.role);
    } catch (error) {
      console.log("error to fetch profile: ", error);
    }
  }

  const fetchUsersByRole = async (role) => {
  try {
    const res = await axios.get(`/api/v1/company/users/${role}`, {
      withCredentials: true,
    });

    setUsersList(res.data.data || []);
    setSelectedRole(role);
    setShowUsers(true); 
  } catch (error) {
    console.log("Failed to fetch users by role:", error);
    setUsersList([]);
    setSelectedRole(role);
    setShowUsers(true);
  }
};


  useEffect(() => {
    fetchMyCompany();
    fetchProfile();
  }, []);

  const handleEditClick = (field) => {
    if (role != "admin") {
      setShowmsg(true);
      return;
    }
    setEditField(field);
    setEditData({ ...company });
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const res = await axios.put("/api/v1/my-company", editData, {
        withCredentials: true,
      });
      setCompany(res.data.data);
      setEditField(null);
    } catch (error) {
      console.log("update failed: ", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-indigo-600 w-6 h-6" />
        <span className="ml-2 text-gray-600">Loading company info...</span>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-500 font-medium">{error}</div>
    );

  if (!company)
    return (
      <div className="p-6 text-center text-gray-500">
        No company information found.
      </div>
    );

  return (
    <div>
        <div className="pt-28 pl-72 pr-6 pb-10 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Company Profile</h1>
      </div>

      <div className="bg-white shadow-md rounded-2xl py-8 px-4 border border-gray-200 max-w-6xl">
        {/* Company Info Section */}
        <div className="mb-8">
          <div className="flex flex-row items-center justify-between border-b border-gray-300 pb-2 mb-4">
            <h2 className="text-xl ml-2 font-semibold text-gray-700">
              Company Information
            </h2>
          </div>

          {/* Information rows */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Name</span>
              <span className="text-gray-800 font-normal">
                {company.company_name}
              </span>
              <button className="cursor-pointer" onClick={() => handleEditClick("company_name")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Email</span>
              <span className="text-gray-800 font-normal">
                {company.company_email}
              </span>
              <button className="cursor-pointer" onClick={() => handleEditClick("company_email")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Plan</span>
              <span className="text-gray-800 font-normal">
                {company.plan}
              </span>
              <button className="cursor-pointer" onClick={() => handleEditClick("plan")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-start items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Status</span>
              <span className="text-gray-800 font-normal ml-115">
                {company.isVerified ? (
                  <span className="text-green-600 font-medium">Verified</span>
                ) : (
                  <span className="text-yellow-600 font-medium">
                    Not Verified
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Team Info Section */}
        <div className="mb-8">
          <div className="flex flex-row items-center justify-between border-b border-gray-300 pb-2 mb-4">
            <h2 className="text-xl ml-2 font-semibold text-gray-700">
              Team Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Admins</span>
              <span className="text-gray-800 font-normal">
                {company.no_of_admin}
              </span>
              <button className="cursor-pointer" onClick={() => fetchUsersByRole("admin")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Staff</span>
              <span className="text-gray-800 font-normal ml-5">
                {company.no_of_staff}
              </span>
              <button className="cursor-pointer" onClick={() => fetchUsersByRole("staff")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Address & Timezone Section */}
        <div className="mb-8">
          <div className="flex flex-row items-center justify-between border-b border-gray-300 pb-2 mb-4">
            <h2 className="text-xl ml-2 font-semibold text-gray-700">
              Address & Timezone
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Address</span>
              <span className="text-gray-800 font-normal">
                {company.address || "N/A"}
              </span>
              <button className="cursor-pointer" onClick={() => handleEditClick("address")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Timezone</span>
              <span className="text-gray-800 font-normal">
                {company.timezoneFrom && company.timezoneTo
                  ? `${company.timezoneFrom} - ${company.timezoneTo}`
                  : "N/A"}
              </span>
              <button className="cursor-pointer" onClick={() => handleEditClick("timezone")}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>  

      {showmsg && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white relative rounded-lg shadow-lg p-6 w-full max-w-sm">
            <button
              onClick={() => setShowmsg(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
            >
              <X size={18} />
            </button>
            <p className="mb-4 flex flex-row justify-center mt-4 text-gray-800 font-normal">You have no permission to edit fields.</p>
            <div className="flex justify-center gap-3">
            </div>
          </div>
        </div>
      )}


      {editField && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white relative rounded-lg shadow-lg p-6 w-full max-w-md">
            <button
              onClick={() => setEditField(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Update Your {editField.replace("_", " ")}
            </h2>

            <div className="space-y-3">
              {editField === "company_name" && (
                <input
                  type="text"
                  name="company_name"
                  value={editData.company_name || ""}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
                />
              )}

              {editField === "company_email" && (
                <input
                  type="email"
                  name="company_email"
                  value={editData.company_email || ""}
                  onChange={handleChange}
                  placeholder="Company Email"
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
                />
              )}

              {editField === "plan" && (
                <input
                  type="text"
                  name="plan"
                  value={editData.plan || ""}
                  onChange={handleChange}
                  placeholder="Plan"
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
                />
              )}

              {editField === "address" && (
                <input
                  type="text"
                  name="address"
                  value={editData.address || ""}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
                />
              )}

              {editField === "timezone" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="timezoneFrom"
                    value={editData.timezoneFrom || ""}
                    onChange={handleChange}
                    placeholder="From"
                    className="w-1/3 border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
                  />
                  
                  <input
                    type="text"
                    name="timezoneTo"
                    value={editData.timezoneTo || ""}
                    onChange={handleChange}
                    placeholder="To"
                    className="w-1/3 border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditField(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUsers && (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white relative rounded-lg shadow-lg p-6 w-full max-w-md">
          <button
            onClick={() => setShowUsers(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
          >
            <X size={18} />
          </button>

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {selectedRole === "admin" ? "Admins" : "Staff"}
          </h2>

          {usersList.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {usersList.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center border-b border-gray-200 pb-2"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{user.username || "N/A"}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No {selectedRole}s found for this company.
            </p>
          )}
        </div>
      </div>
    )}
  </div>
);
}

export default Company;
