import React from "react";
import { Users, Package, UserCheck, UserCog, AlertTriangle, Truck } from "lucide-react";

const iconMap = {
  staff: <Users className="text-purple-600 w-6 h-6" />,
  admins: <UserCog className="text-purple-600 w-6 h-6" />,
  suppliers: <Truck className="text-purple-600 w-6 h-6" />,
  customers: <UserCheck className="text-purple-600 w-6 h-6" />,
  products: <Package className="text-purple-600 w-6 h-6" />,
  lowstock: <AlertTriangle className="text-purple-600 w-6 h-6" />,
};

function DashboardStatsCard({ title, count, iconType, color }) {
  return (
    <div className="flex flex-col justify-between p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 w-[240px] h-[140px] border border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mt-1">{title}</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-1 ml-1">{count}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-xl">{iconMap[iconType]}</div>
      </div>
      <div className={`h-1 rounded-full mt-3 ${color}`}></div>
    </div>
  );
}

export default DashboardStatsCard;
