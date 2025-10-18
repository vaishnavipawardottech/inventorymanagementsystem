import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Building2, X } from "lucide-react";
import {
  LayoutDashboard,
  Box,
  Users,
  ShoppingCart,
  CircleDollarSign,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openPurchases, setOpenPurchases] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_email: "",
    plan: "free"
  })

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    // later add api call to save company info
    setShowCompanyModal(false);
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-4 px-6 py-3 ml-6 mr-8 mt-2 rounded-md transition 
     ${
       isActive
         ? "bg-gray-100 text-indigo-600 font-medium"
         : "text-gray-700 hover:bg-gray-100 hover:text-black"
     }`;

    const subLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-2 ml-1 mr-10 mt-1 rounded-md text-sm transition
     ${
       isActive
         ? "bg-gray-100 text-indigo-600 font-medium"
         : "text-gray-700 hover:bg-gray-100 hover:text-black"
     }`;

  const handlePurchasesClick = () => {
    setOpenPurchases((prev) => {
      const newState = !prev;

      // When dropdown opens, navigate to /drafts if not already there
      if (newState && !location.pathname.startsWith("/drafts")) {
        navigate("/drafts");
      }

      return newState;
    });
  };

  return (
    <div className="w-64 bg-white fixed top-16 left-0 h-full border-r border-gray-300 z-40">
      <div className="flex flex-col mt-6">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={linkClasses}>
          <LayoutDashboard className="h-5 w-5 text-gray-600" />
          <span className="text-black font-normal">Dashboard</span>
        </NavLink>

        {/* Products */}
        <NavLink to="/products" className={linkClasses}>
          <Box className="h-5 w-5 text-gray-600" />
          <span className="text-black font-normal">Products</span>
        </NavLink>

        {/* Sales */}
        <NavLink to="/sales" className={linkClasses}>
          <CircleDollarSign className="h-5 w-5 text-gray-600" />
          <span className="text-black font-normal">Sales</span>
        </NavLink>

        {/* Suppliers */}
        <NavLink to="/suppliers" className={linkClasses}>
          <Users className="h-5 w-5 text-gray-600" />
          <span className="text-black font-normal">Suppliers</span>
        </NavLink>

        {/* Purchases Dropdown */}
        <div
          onClick={handlePurchasesClick}
          className={`flex items-center justify-between gap-4 px-6 py-3 ml-6 mr-8 mt-2 rounded-md cursor-pointer transition text-gray-700 hover:bg-gray-100 hover:text-black`}
        >
          <div className="flex items-center gap-4">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <span className="text-black font-normal">Purchases</span>
          </div>
          {openPurchases ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </div>

        {openPurchases && (
          <div className="ml-20 border-l border-gray-300 flex flex-col">
            <NavLink to="/drafts" className={subLinkClasses}>
              <span className="text-black font-normal">Create Draft</span>
            </NavLink>
            <NavLink to="/orders" className={subLinkClasses}>
              <span className="text-black font-normal">See Orders</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Company Button */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t mb-15 border-gray-200">
        <button
          onClick={() => setShowCompanyModal(true)}
          className="flex items-start gap-3 w-full ml-10 text-black py-2 rounded-md font-normal "
        >
          <Building2 className="text-gray-600 h-5 w-5" /> Company
        </button>
      </div>

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-[90%] max-w-md border border-gray-200">
            <button
                onClick={() => setShowCompanyModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
              >
                <X size={20} />
              </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Add Company Details</h2>

            <form className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Company Name"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                placeholder="Role"
                className="border border-gray-300 rounded-md p-2"
              />
            </form>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Backend will be connected later
                  setShowCompanyModal(false);
                }}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
