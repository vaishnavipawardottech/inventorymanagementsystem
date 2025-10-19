import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Edit3 } from "lucide-react";

function Company() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchMyCompany();
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
    <div className="pt-28 pl-72 pr-6 pb-10 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Company Profile</h1>
        <button
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          title="Edit Company Info"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200 max-w-4xl">
        {/* Company Info Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Company Information
          </h2>
          <div className="space-y-4">
            <InfoRow label="Name" value={company.company_name} />
            <InfoRow label="Email" value={company.company_email} />
            <InfoRow label="Plan" value={company.plan} />
            <InfoRow
              label="Status"
              value={
                company.isVerified ? (
                  <span className="text-green-600 font-medium">Verified</span>
                ) : (
                  <span className="text-yellow-600 font-medium">
                    Not Verified
                  </span>
                )
              }
            />
          </div>
        </div>

        {/* Team Info Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Team Information
          </h2>
          <div className="space-y-4">
            <InfoRow label="Admins" value={company.no_of_admin} />
            <InfoRow label="Staff" value={company.no_of_staff} />
          </div>
        </div>

        {/* Address & Timezone Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Address & Timezone
          </h2>
          <div className="flex flex-col gap-4">
            <InfoRow label="Address" value={company.address || "N/A"} />
            <InfoRow
              label="Timezone"
              value={
                company.timezoneFrom && company.timezoneTo
                  ? `${company.timezoneFrom} - ${company.timezoneTo}`
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-xs text-gray-500 flex justify-between">
          <span>
            Created at: {new Date(company.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Reusable row component
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold">{value}</span>
    </div>
  );
}

export default Company;
