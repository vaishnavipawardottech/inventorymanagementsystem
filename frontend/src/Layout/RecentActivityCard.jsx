import React from "react";
import { CalendarDays, User } from "lucide-react";

function RecentActivityCard({ username, type, description, date }) {
  const formattedDate = new Date(date).toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex justify-between items-start border-b border-gray-100 py-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <User size={16} className="text-indigo-600" />
          <span>{username}</span>
          <span className="text-gray-400 text-sm">({type})</span>
        </div>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <div className="flex items-center text-gray-400 text-xs gap-1">
        <CalendarDays size={14} />
        {formattedDate}
      </div>
    </div>
  );
}

export default RecentActivityCard;
