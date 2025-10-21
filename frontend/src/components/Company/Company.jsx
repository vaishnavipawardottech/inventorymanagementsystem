import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Pencil, ChevronRight, X } from "lucide-react";

function Company() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showmsg, setShowmsg] = useState(false);

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

  useEffect(() => {
    fetchMyCompany();
    fetchProfile();
  }, []);

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
      {role === "admin"? (
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
              <span className="text-gray-800 font-normal mr-11">
                {company.company_name}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Email</span>
              <span className="text-gray-800 font-normal">
                {company.company_email}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Plan</span>
              <span className="text-gray-800 font-normal mr-25">
                {company.plan}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Status</span>
              <span className="text-gray-800 font-normal mr-21">
                {company.isVerified ? (
                  <span className="text-green-600 font-medium">Verified</span>
                ) : (
                  <span className="text-yellow-600 font-medium">
                    Not Verified
                  </span>
                )}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
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
              <span className="text-gray-800 font-normal mr-25">
                {company.no_of_admin}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Staff</span>
              <span className="text-gray-800 font-normal mr-19">
                {company.no_of_staff}
              </span>
              <button className="cursor-pointer">
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
              <span className="text-gray-800 font-normal mr-20">
                {company.address || "N/A"}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Timezone</span>
              <span className="text-gray-800 font-normal mr-28">
                {company.timezoneFrom && company.timezoneTo
                  ? `${company.timezoneFrom} - ${company.timezoneTo}`
                  : "N/A"}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="border-t pt-4 text-xs text-gray-500 ml-2 flex justify-between">
          <span>
            Created at:{" "}
            {new Date(company.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div> */}
      </div>
    </div>
      ) : (
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
              <span className="text-gray-800 font-normal mr-11">
                {company.company_name}
              </span>
              <button className="cursor-pointer" onClick={() => setShowmsg(true)}>
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Email</span>
              <span className="text-gray-800 font-normal">
                {company.company_email}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Plan</span>
              <span className="text-gray-800 font-normal mr-25">
                {company.plan}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Status</span>
              <span className="text-gray-800 font-normal mr-21">
                {company.isVerified ? (
                  <span className="text-green-600 font-medium">Verified</span>
                ) : (
                  <span className="text-yellow-600 font-medium">
                    Not Verified
                  </span>
                )}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
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
              <span className="text-gray-800 font-normal mr-25">
                {company.no_of_admin}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Staff</span>
              <span className="text-gray-800 font-normal mr-19">
                {company.no_of_staff}
              </span>
              <button className="cursor-pointer">
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
              <span className="text-gray-800 font-normal mr-20">
                {company.address || "N/A"}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-normal ml-5">Timezone</span>
              <span className="text-gray-800 font-normal mr-28">
                {company.timezoneFrom && company.timezoneTo
                  ? `${company.timezoneFrom} - ${company.timezoneTo}`
                  : "N/A"}
              </span>
              <button className="cursor-pointer">
                <ChevronRight className="w-4 h-4 text-purple-700 mr-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="border-t pt-4 text-xs text-gray-500 ml-2 flex justify-between">
          <span>
            Created at:{" "}
            {new Date(company.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div> */}
      </div>
    </div>
      )}  

      {showmsg && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <button
              onClick={() => setShowmsg(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
            >
              <X size={20} />
            </button>
            <p className="mb-8 flex flex-row justify-center mt-3 text-gray-800 font-normal">You have no permission to edit fields.</p>
            <div className="flex justify-center gap-3">
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Company;
