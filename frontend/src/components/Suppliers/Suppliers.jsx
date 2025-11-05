import React, {useState, useEffect} from 'react'
import axios from "axios";
import { Plus, Edit, Trash2, Info, Search } from 'lucide-react';
import SupplierForm from '../SupplierForm/SupplierForm';

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [viewSupplier, setViewSupplier] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);

    const fetchSuppliers = async () => {
        try {
        setLoading(true);
        const res = await axios.get("/api/v1/suppliers", {
            params: { search },
        });
        setSuppliers(res.data.data.suppliers || []);
        } catch (err) {
        console.error("Error fetching suppliers:", err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [search]);

    const handleDelete = async (id) => {
        try {
        await axios.delete(`/api/v1/supplier/${id}`);
        fetchSuppliers();
        } catch (err) {
        console.error("Error deleting supplier:", err);
        }
    };


  return (
    <div className="pt-30 pl-70 pr-6 pb-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Suppliers</h1>  
      </div>

      {/* Search */}
      <div className="mb-3 flex flex-row items-center justify-between">
        <div className='relative flex-1 w-full max-w-80'>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-70 px-3 pl-10 py-2 border rounded-lg shadow-sm  border-gray-200 bg-white"
        />
        </div>
        
        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mr-8"
        >
          <Plus size={20} /> Add Supplier
        </button>
      </div>

        {/* Cards */}
        {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
        ) : suppliers.length > 0 ? (
        <div className="flex flex-wrap gap-6 border-t border-gray-200 py-3 px-1">
            {suppliers.map((supplier) => (
            <div
                key={supplier.id}
                className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between w-[22%] min-w-[270px]" // 4 in a row
            >
                {/* Supplier Info */}
                <div>
                {/* <h2 className="text-lg font-semibold text-gray-600">
                    {supplier.name}
                </h2> */}
                <p className="text-gray-800 mt-1 text-sm">
                    <span className="font-medium">Supplier:</span> {supplier.name}
                </p>
                <p className="text-gray-800 text-sm mt-1">
                    <span className="font-medium">Phone:</span> {supplier.phone}
                </p>
                <p className="text-gray-800 text-sm mt-1">
                    <span className="font-medium">Email:</span>{" "}
                    {supplier.email || "-"}
                </p>
                <p className="text-gray-800 text-sm mt-1">
                    <span className="font-medium">Address:</span>{" "}
                    {supplier.address || "-"}
                </p>
                
                </div>

                {/* Actions - moved to bottom, centered */}
                <div className="flex justify-start gap-3 mt-4">
                <button
                    onClick={() => {
                    setEditingSupplier(supplier);
                    setShowForm(true);
                    }}
                    className="p-1 cursor-pointer rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => {
                        setSupplierToDelete(supplier.id);
                        setShowDeleteModal(true);
                    }}
                    className="p-1 cursor-pointer rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm"
                >
                    <Trash2 size={18} />
                </button>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                    Added on:{" "}
                    {new Date(supplier.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"2-digit", year:"numeric" })}
                </p>
            </div>
            ))}
        </div>
        ) : (
        <p className="text-center text-gray-500">No suppliers found.</p>
        )}


      {/* Supplier Form Modal */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={() => setShowForm(false)}
          onSubmit={fetchSuppliers}
        />
      )}

      {/* Supplier View Modal */}
      {viewSupplier && (
        <SupplierView
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
        />
      )}

      {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Delete Supplier</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this Supplier?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete(supplierToDelete);
                  setShowDeleteModal(false);
                  setSupplierToDelete(null);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        )}

    </div>
  );
  
}

export default Suppliers