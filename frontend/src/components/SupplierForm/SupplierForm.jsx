import React, {useState} from 'react'
import { X } from 'lucide-react';
import axios from "axios"

function SupplierForm({supplier, onClose, onSubmit, }) {
    const [formData, setFormData] = useState({
        name: supplier?.name || "",
        email: supplier?.email || "",
        phone: supplier?.phone || "",
        address: supplier?.address || "",
    });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (supplier) {
        await axios.patch(`/api/v1/supplier/${supplier.id}`, formData);
      } else {
        await axios.post("/api/v1/create-supplier", formData);
      }
      onSubmit();
      onClose();
    } catch (err) {
      console.error("Error saving supplier:", err);
    }
  };
  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px]">
        {/* Close button */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-white p-1 hover:bg-red-500 rounded"
            >
            <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {supplier ? "Edit Supplier" : "Add Supplier"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Phone *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 text-white rounded-lg"
            >
              {supplier ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupplierForm