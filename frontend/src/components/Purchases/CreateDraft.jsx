import React, { useEffect, useState } from "react";
import axios from "axios";
import { Send, FileText, Loader2, X, Trash2, Save, Plus } from "lucide-react";
import Modal from "../../Layout/Modal.jsx";
import Pagination from "../../Layout/Pagination.jsx";

function CreateDraft() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [newDraft, setNewDraft] = useState({
    supplier_id: "",
    items: [{product_id: "", quantity: 1}],
  });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get("/api/v1/drafts");
      setDrafts(res.data.data);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDraft = async (id) => {
    try {
      await axios.post(`/api/v1/send-draft/${id}`);
      fetchDrafts();
    } catch (error) {
      console.error("Failed to send draft:", error);
    }
  };

  const handleQuantityChange = (index, newQty) => {
    const updated = [...editableItems];
    updated[index].quantity = newQty;
    setEditableItems(updated);
  }

  const handleRemoveItem = (index) => {
    const updated = [...editableItems];
    updated.splice(index, 1);
    setEditableItems(updated);
  }

  const handleAddProduct = () => {
    const updated = [...editableItems];
    updated.push({
      product_id: "",
      product_name: "",
      quantity: 1,
      price: 0
    });
    setEditableItems(updated);
  }

  const handleProductChange = (index, productId) => {
    const updated = [...editableItems];
    const selectedProduct = products.find(p => p.id === parseInt(productId));
    if (selectedProduct) {
      updated[index].product_id = selectedProduct.id;
      updated[index].product_name = selectedProduct.name;
      updated[index].price = selectedProduct.price;
    }
    setEditableItems(updated);
  }

  const handleSaveChanges = async () => {
    try {
      await axios.put(`/api/v1/draft/${selectedDraft.id}`, {
        items: editableItems.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      });
      setSelectedDraft(null);
      fetchDrafts();   
    } catch (error) {
      console.log("Failed to update draft: ", error);
    }
  }

  const handleDeleteDraft = async () => {
    try {
      await axios.delete(`/api/v1/draft/${draftToDelete}`);
      setShowDeleteConfirm(false);
      setDraftToDelete(null);
      setSelectedDraft(null);
      fetchDrafts();
    } catch (error) {
      console.log("Failed to delete draft: ", error);
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("/api/v1/suppliers")
      setSuppliers(res.data.data.suppliers)
    } catch (error) {
      console.log("Error loading suppliers: ", error);
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/v1/allproducts");
      setProducts(res.data.data);
    } catch (error) {
      console.log("Error loading products: ", error);
      
    }
  }

  const handleCreateDraft = async () => {
    try {
      await axios.post("/api/v1/create-draft", newDraft);
      setShowCreateModal(false);
      fetchDrafts();
      setNewDraft({
        supplier_id: "",
        items: [{product_id: "", quantity: 1}],
      })
    } catch (error) {
      console.log("Failed to create draft: ", error);
    }
  }

  // const savePrices = async (purchaseId, items) => {
  // try {
  //   await axios.put(`/api/v1/update-price/${purchaseId}`, {
  //     items: items.map(i => ({ product_id: i.product_id, price: i.price })),
  //   });
  //   fetchPurchases(); // reload purchase list
  // } catch (err) {
  //   console.error("Failed to update prices", err);
  // }
  // };


  useEffect(() => {
    fetchDrafts();
    fetchSuppliers();
    fetchProducts();
  }, []);

  return (
    <div className="pt-30 pl-70 pr-6 pb-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Purchase Drafts</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center mr-9 gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800"
          >
            <Plus size={20} /> Create Draft
          </button>
        </div>


      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
      ) : drafts.length === 0 ? (
        <p className="text-gray-500 text-center">No drafts found.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-6 border-t border-gray-200 py-3 px-1 justify-start">
            {drafts.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((draft) => (
            <div
              key={draft.id}
              className="relative flex flex-col justify-between bg-white shadow-md rounded-2xl p-5 border hover:shadow-lg transition w-full sm:w-[48%] lg:w-[31%]"
            >
              <div
                className={`absolute top-0 right-0 translate-x-[1px] -translate-y-[1px] px-3 py-2 rounded-bl-lg text-xs font-semibold shadow-sm ${
                  draft.status === "ordered"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {draft.status}
              </div>
              <div>
                <div className="mb-3">
                  {/* Supplier Name */}
                  <h2 className="text-lg font-medium text-gray-800">
                    Supplier: {draft.supplier_name}
                  </h2>
                </div>

                <p className="text-gray-600 text-sm font-medium">
                  Email:{" "}
                  <span className="font-normal">{draft.supplier_email}</span>
                </p>
                <p className="text-gray-600 text-sm font-medium">
                  Created By:{" "}
                  <span className="font-normal">{draft.created_by_name}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedDraft(draft);
                    setEditableItems(draft.products || []);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100 text-sm font-medium"
                >
                  <FileText size={16} /> View List
                </button>
                <button
                  onClick={() => handleSendDraft(draft.id)}
                  disabled={draft.status === "sent"}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium ${
                    draft.status === "sent"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-700 hover:bg-purple-800"
                  }`}
                >
                  <Send size={16} /> Send Draft
                </button>

              </div>
            </div>
          ))}
          </div>

          {drafts.length > 6 && (
            <div className="border-t border-gray-200 py-3 px-1">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(drafts.length / rowsPerPage)}
                onPageChange={(p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(r) => {
                  setRowsPerPage(r);
                  setPage(1);
                }}
                totalItems={drafts.length}
              />
            </div>
          )}
        </>
      )}

      {/* Editable Modal */}
      <Modal
        isOpen={!!selectedDraft}
        onClose={() => setSelectedDraft(null)}
        title="Edit Draft Items"
      >
        {selectedDraft && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[85%] max-w-2xl">
              <button
                onClick={() => setSelectedDraft(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Supplier: {selectedDraft.supplier_name}
              </h2>

              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border w-24">Qty</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Estimated Cost</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {editableItems.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">
                        {p.product_name ? (
                          p.product_name
                        ) : (
                          <select
                            value={p.product_id}
                            onChange={(e) => handleProductChange(i, e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={p.quantity}
                          onChange={(e) =>
                            handleQuantityChange(i, e.target.value)
                          }
                          className="w-16 border rounded px-1 py-0.5 text-center"
                          min="1"
                        />
                      </td>
                      <td className="p-2 border">₹{p.price}</td>
                      <td className="p-2 border">
                        ₹{(p.quantity * p.price).toFixed(2)}
                      </td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => handleRemoveItem(i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 mt-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                <Plus size={16} /> Add Product
              </button>

              <div className="text-right text-lg mt-3 mr-3 font-semibold">
                Estimated Cost: ₹
                {editableItems.reduce(
                  (sum, p) => sum + p.quantity * p.price,
                  0
                )}
              </div>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() => {
                    setDraftToDelete(selectedDraft.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 mr-3"
                >
                  <Trash2 size={16} /> Delete Draft
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDraftToDelete(null);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDraft}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Purchase Draft"
      >
        <div className="bg-white p-1 rounded-lg w-[90%] max-w-2xl mx-auto">
          <div className="space-y-4">
            {/* Supplier Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <select
                value={newDraft.supplier_id}
                onChange={(e) =>
                  setNewDraft({ ...newDraft, supplier_id: e.target.value })
                }
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Items */}
            <div>
              <h3 className="text-md font-medium mb-2">Items</h3>
              {newDraft.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const updated = [...newDraft.items];
                      updated[i].product_id = e.target.value;
                      setNewDraft({ ...newDraft, items: updated });
                    }}
                    className="flex-1 border rounded px-2 py-1"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...newDraft.items];
                      updated[i].quantity = e.target.value;
                      setNewDraft({ ...newDraft, items: updated });
                    }}
                    className="w-20 border rounded px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => {
                      const updated = newDraft.items.filter((_, idx) => idx !== i);
                      setNewDraft({ ...newDraft, items: updated });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}

              {/* Add Item Button */}
              <button
                onClick={() =>
                  setNewDraft({
                    ...newDraft,
                    items: [...newDraft.items, { product_id: "", quantity: 1 }],
                  })
                }
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                + Add Another Item
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-5">
              <button
                onClick={handleCreateDraft}
                disabled={!newDraft.supplier_id || newDraft.items.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                <Save size={16} /> Save Draft
              </button>
            </div>
          </div>
        </div>
      </Modal>


    </div>
  );
}

export default CreateDraft;
