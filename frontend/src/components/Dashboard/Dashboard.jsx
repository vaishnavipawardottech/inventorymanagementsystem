import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardStatsCard from "../../Layout/DashboardStatsCard.jsx"
import Pagination from "../../Layout/Pagination.jsx";
import { Loader2 } from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get("/api/v1/dashboard-stats", { withCredentials: true });
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchLogs = async (pageNumber = 1) => {
  //   try {
  //     const res = await axios.get(`/api/v1/logs?page=${pageNumber}&limit=${limit}`, {
  //       withCredentials: true,
  //     });
  //     setLogs(res.data.data.logs);
  //     setTotalPages(res.data.data.totalPages);
  //     setPage(res.data.data.currentPage);
  //   } catch (error) {
  //     console.error("Failed to fetch logs:", error);
  //   }
  // };

  const fetchLogs = async (pageNumber = 1, limitValue = rowsPerPage) => {
  try {
    const res = await axios.get(`/api/v1/logs?page=${pageNumber}&limit=${limitValue}`, {
      withCredentials: true,
    });
    setLogs(res.data.data.logs);
    setTotalPages(res.data.data.totalPages);
    setTotalItems(res.data.data.total);
    setPage(res.data.data.currentPage);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
  }
};

  useEffect(() => {
    fetchDashboardStats();
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        <span className="ml-2 text-gray-600 text-lg">Loading dashboard...</span>
      </div>
    );

  return (
    <div className="pt-28 pl-72 pr-8 pb-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Section */}
      <div className="flex flex-wrap gap-6 mb-10">
        <DashboardStatsCard
          title="Total Admins"
          count={stats?.total_admins}
          iconType="admins"
          color="bg-green-500"
        />
        <DashboardStatsCard
          title="Total Staff"
          count={stats?.total_staff}
          iconType="staff"
          color="bg-indigo-500"
        />
        <DashboardStatsCard
          title="Total Suppliers"
          count={stats?.total_suppliers}
          iconType="suppliers"
          color="bg-yellow-500"
        />
        <DashboardStatsCard
          title="Total Customers"
          count={stats?.total_customers}
          iconType="customers"
          color="bg-purple-500"
        />
        <DashboardStatsCard
          title="Total Products"
          count={stats?.total_products}
          iconType="products"
          color="bg-blue-500"
        />
        <DashboardStatsCard
          title="Low Stock Items"
          count={stats?.low_stock_items}
          iconType="lowstock"
          color="bg-red-500"
        />
      </div>

      {/* Placeholder for upcoming sections */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sales Overview
          </h2>
          <p className="text-gray-500 text-sm">
            Sales charts or analytics will appear here.
          </p>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activities
        </h2>

        <div className="divide-y divide-gray-200">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium">{log.action_type}</p>
                  <p className="text-gray-600 text-sm">
                    {log.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700 text-sm font-medium">
                    {log.username} ({log.role})
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No recent activities found.
            </p>
          )}
        </div>

        {/* ✅ Custom Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setPage(1); // reset to first page when user changes rowsPerPage
          }}
          totalItems={totalItems}
        />
      </div>
      </div>
    </div>
  );
}

export default Dashboard;
