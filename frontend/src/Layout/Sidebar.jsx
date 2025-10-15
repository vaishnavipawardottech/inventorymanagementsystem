import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
    <div className="w-64 bg-white fixed top-16 left-0 h-full border-r border-gray-300">
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

        {/* Logout */}
        {/* <NavLink to="/logout" className={linkClasses}>
          <LogOut className="h-5 w-5 text-gray-600" />
          <span className="text-black font-normal">Logout</span>
        </NavLink> */}
      </div>
    </div>
  );
}

export default Sidebar;
