import React from "react";
import { Users, Package, UserCheck, UserCog, AlertTriangle, Truck } from "lucide-react";

const colorMap = {
  "bg-green-500": "text-green-500",
  "bg-indigo-500": "text-indigo-500",
  "bg-yellow-500": "text-yellow-500",
  "bg-purple-500": "text-purple-500",
  "bg-blue-500": "text-blue-500",
  "bg-red-500": "text-red-500",
};

const iconMap = (iconColor) => ({
  staff: <Users className={`${iconColor} w-6 h-6`} />,
  admins: <UserCog className={`${iconColor} w-6 h-6`} />,
  suppliers: <Truck className={`${iconColor} w-6 h-6`} />,
  customers: <UserCheck className={`${iconColor} w-6 h-6`} />,
  products: <Package className={`${iconColor} w-6 h-6`} />,
  lowstock: <AlertTriangle className={`${iconColor} w-6 h-6`} />,
});

function DashboardStatsCard({ title, count, iconType, color }) {
  const iconColor = colorMap[color] || "text-purple-500";
  
  return (
    <div className="flex flex-col justify-between p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 w-[240px] h-[120px] border border-gray-100">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-3xl font-semibold text-gray-800">{count}</p>
          <div className="bg-blue-50 p-3 rounded-xl">{iconMap(iconColor)[iconType]}</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStatsCard;
