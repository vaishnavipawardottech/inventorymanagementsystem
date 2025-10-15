import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, X } from "lucide-react";
import Modal from "../Layout/Modal.jsx";

function UpdatePurchasePrice({ purchaseId, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch items of this purchase
  const fetchPurchaseItems = async () => {
    try {
      const res = await axios.get(`/api/v1/purchases/${purchaseId}`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch purchase items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Change handler
  const handlePriceChange = (index, value) => {
    const updated = [...items];
    updated[index].price = parseFloat(value) || 0;
    setItems(updated);
  };

  // Save prices to backend
  const handleSave = async () => {
    try {
      await axios.put(`/api/v1/update-price/${purchaseId}`, {
        items: items.map((i) => ({
          product_id: i.product_id,
          price: i.price,
        })),
      });
      alert("✅ Prices updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to update prices", err);
      alert(" Failed to update prices");
    }
  };

  useEffect(() => {
    if (purchaseId) fetchPurchaseItems();
  }, [purchaseId]);

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <Modal isOpen={!!purchaseId} onClose={onClose} title="Update Purchase Prices">
      <div className="relative bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-3xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
        >
          <X size={20} />
        </button>

        {/* Table */}
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full border border-gray-200 text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Product</th>
                <th className="p-2 border text-center">Quantity</th>
                <th className="p-2 border text-center">Price (₹)</th>
                <th className="p-2 border text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{item.product_name}</td>
                    <td className="p-2 border text-center">{item.quantity}</td>
                    <td className="p-2 border text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price || ""}
                        onChange={(e) => handlePriceChange(i, e.target.value)}
                        className="w-24 border rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-green-400"
                      />
                    </td>
                    <td className="p-2 border text-right">
                      {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No items found for this purchase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-5">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default UpdatePurchasePrice;
