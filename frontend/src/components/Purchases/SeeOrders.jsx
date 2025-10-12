import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Eye } from "lucide-react";
import Modal from "../../Layout/Modal.jsx";

function SeeOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/v1/purchases");
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center">No orders found.</p>
      ) : (
        // ✅ FLEXBOX LAYOUT HERE
        <div className="flex flex-wrap gap-6 justify-start">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col justify-between bg-white shadow-md rounded-2xl p-5 border hover:shadow-lg transition w-full sm:w-[48%] lg:w-[31%]"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium text-gray-800">
                    Supplier: {order.supplier_name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">
                  Total Amount:{" "}
                  <span className="font-semibold">₹{order.total_amount}</span>
                </p>
                <p className="text-gray-600 text-sm">
                  Created By:{" "}
                  <span className="font-medium">{order.created_by_name}</span>
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Created on: {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100 text-sm font-medium"
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL SECTION */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div>
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
        )}
      </Modal>
    </div>
  );
}

export default SeeOrders;
