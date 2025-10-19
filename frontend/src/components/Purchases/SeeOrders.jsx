import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Eye, X, FileText, CircleCheckBig, ChevronDown } from "lucide-react";
import Modal from "../../Layout/Modal.jsx";
import UpdatePurchasePrice from "../../Layout/UpdatePurchasePrice.jsx";

function SeeOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatePurchaseId, setUpdatePurchaseId] = useState(null);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const options = [
    { value: "all", label: "Status" },
    { value: "delivered", label: "Delivered" },
    { value: "ordered", label: "Ordered" },
  ];

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/v1/ordered");
      setOrders(res.data.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="pt-30 pl-70 pr-6 pb-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Purchase Orders
      </h1>

      {/* STATUS FILTER DROPDOWN */}
      <div className="mb-3 flex flex-col md:flex-row justify-start gap-4">
        <div className="relative w-full max-w-56">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center border p-2 rounded-full 
                          cursor-pointer hover:bg-gray-100 transition"
          >
            <span>
              {options.find((option) => option.value === statusFilter)?.label || "Status"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>

          {open && (
            <ul className="absolute left-0 mt-2 w-full bg-white border rounded-xl shadow-md z-10">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setOpen(false);
                  }}
                  className="px-4 py-2 cursor-pointer rounded-lg hover:bg-gray-100"
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
      ) : (
        (() => {
          // Apply filter here
          const filteredOrders =
            statusFilter === "all"
              ? orders
              : orders.filter((order) => order.status === statusFilter);

          return filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-center">No orders found.</p>
          ) : (
            <div className="flex flex-wrap gap-6 border-t border-gray-200 py-3 px-1 justify-start">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="relative flex flex-col justify-between bg-white shadow-md rounded-2xl p-5 border hover:shadow-lg transition w-full sm:w-[48%] lg:w-[31%]"
                >
                  <div
                    className={`absolute top-0 right-0 translate-x-[1px] -translate-y-[1px] px-3 py-2 rounded-bl-lg text-xs font-semibold shadow-sm ${
                      order.status === "delivered"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-medium text-gray-800">
                        Supplier: {order.supplier_name}
                      </h2>
                    </div>

                    <p className="text-gray-600 text-sm font-medium">
                      Total Amount:{" "}
                      <span className="font-normal">
                        ₹
                        {order.products?.reduce(
                          (sum, p) => sum + p.quantity * p.price,
                          0
                        )}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      Created By:{" "}
                      <span className="font-normal">{order.created_by_name}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Created on: {new Date(order.created_at).toLocaleString("en-IN", {day: "2-digit", month: "2-digit", year: "numeric"})}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100 text-sm font-medium"
                    >
                      <Eye size={16} /> View Details
                    </button>

                    {order.status === "ordered" && (
                      <button
                        onClick={async () => {
                          try {
                            await axios.put(`/api/v1/delivered/${order.id}`);
                            fetchOrders();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 border text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <CircleCheckBig size={16} /> Mark as Delivered
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <button
                        onClick={() => setUpdatePurchaseId(order.purchase_id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                      >
                        <FileText size={16} /> Update Prices
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}

      {/* ✅ MODAL SECTION */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
              >
                <X size={20} />
              </button>

              <div className="mb-4 text-sm">
                <p>
                  <strong>Supplier:</strong> {selectedOrder.supplier_name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.supplier_email}
                </p>
                <p>
                  <strong>Created By:</strong> {selectedOrder.created_by_name}
                </p>
              </div>

              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products?.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">{p.product_name}</td>
                      <td className="p-2 border">{p.quantity}</td>
                      <td className="p-2 border">₹{p.price}</td>
                      <td className="p-2 border">₹{p.quantity * p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right mt-3 font-semibold">
                Total: ₹
                {selectedOrder.products?.reduce(
                  (sum, p) => sum + p.quantity * p.price,
                  0
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {updatePurchaseId && (
        <UpdatePurchasePrice
          purchaseId={updatePurchaseId}
          onClose={() => setUpdatePurchaseId(null)}
        />
      )}
    </div>
  );
}

export default SeeOrders;
