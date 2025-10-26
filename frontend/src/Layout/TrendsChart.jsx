import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function TrendsChart({ title, data, selectedYear, onYearChange }) {
  // Generate last 5 years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        {/* Year Dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="border px-3 py-1 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="incoming" fill="#3b82f6" name="Incoming Stock" />
          <Bar dataKey="outgoing" fill="#ef4444" name="Outgoing Stock" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendsChart;
