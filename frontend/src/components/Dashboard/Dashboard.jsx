import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardStatsCard from "../../Layout/DashboardStatsCard.jsx"
import Pagination from "../../Layout/Pagination.jsx";
import TrendsChart from "../../Layout/TrendsChart.jsx";
import { Loader2, DollarSign, Package, VectorSquare, Tag, Layers, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState({ userGrowth: [], stockMovements: [] });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  const fetchTrends = async (year = selectedYear) => {
    try {
      const res = await axios.get(`/api/v1/trends?year=${year}`, { withCredentials: true });
      setTrends(res.data.data);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    }
  };

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
    fetchTrends(selectedYear);
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage, selectedYear]);

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

      {/* sections */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          {/* Trends Section */}
          <div className="flex flex-col gap-6">

            {/* Stock Movements Chart */}
            <TrendsChart
              title="Stock Movements (Incoming vs Outgoing)"
              data={trends.stockMovements}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />


            {/* Current Stock Value */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-7">
                Current Stock Value
              </h2>
              <div className="flex justify-between items-center">
              {/* Total Stock Value */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Total Stock Value</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹ {trends.stockValue?.total_value || 0}
                  </p>
                </div>
              </div>

              {/* Total Products */}
              <div className="flex items-center space-x-3 mr-10">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {trends.stockValue?.total_products || 0}
                  </p>
                </div>
              </div>

              {/* Total Product Quantity */}
              <div className="flex items-center space-x-3 mr-10">
                <div className="p-2 bg-purple-100 rounded-full">
                  <VectorSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Total Product Quantity</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {trends.stockValue?.total_quantity || 0}
                  </p>
                </div>
              </div>
            </div>

            </div>

            {/* Top 5 Outgoing Products */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Top 5 Outgoing Products (High Demand)
              </h2>

              {trends.topOutgoing && trends.topOutgoing.length > 0 ? (
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {trends.topOutgoing.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between bg-gray-50 border border-gray-200 rounded-md shadow-sm p-4 w-[220px] hover:shadow-md"
                    >
                      {/* Product Header */}
                      <div className="flex flex-row items-center justify-center mb-6">
                        <h3 className="text-gray-800 font-medium text-lg">
                          {item.product_name}
                        </h3>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span>Price</span>
                          </div>
                          <span className="text-gray-800 font-medium">₹ {item.price || "N/A"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Layers className="w-4 h-4 text-gray-400" />
                            <span>Stock</span>
                          </div>
                          <span className="text-gray-800 font-medium">{item.stock || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                            <span>Status</span>
                          </div>

                          {/* Stock Status Badge */}
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.stock_status === "in_stock"
                                ? "bg-green-100 text-green-700"
                                : item.stock_status === "low_stock"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.stock_status?.replace("_", " ") || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Footer (Total Sold) */}
                      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-gray-600 font-medium">Total Sold:</span>
                        <span className="text-purple-600 font-semibold">
                          {item.total_sold} units
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No outgoing products found.</p>
              )}
            </div>

          </div>

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
                  <p className="text-gray-800 font-medium text-sm">{log.action_type}</p>
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

        {/* Custom Pagination */}
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
