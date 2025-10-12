import React, { useEffect, useState } from "react";
import axios from "axios";
import { Send, FileText, Loader2, X } from "lucide-react";
import Modal from "../../Layout/Modal.jsx";

function CreateDraft() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState(null);

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

  useEffect(() => {
    fetchDrafts();
  }, []);

  return (
    <div className="pt-30 pl-70 pr-6 pb-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Purchase Drafts</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
      ) : drafts.length === 0 ? (
        <p className="text-gray-500 text-center">No drafts found.</p>
      ) : (
        // ✅ FLEXBOX LAYOUT
        <div className="flex flex-wrap gap-6 justify-start">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex flex-col justify-between bg-white shadow-md rounded-2xl p-5 border hover:shadow-lg transition w-full sm:w-[48%] lg:w-[31%]"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium text-gray-800">
                    Supplier: {draft.supplier_name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      draft.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {draft.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">
                  Email:{" "}
                  <span className="font-medium">{draft.supplier_email}</span>
                </p>
                <p className="text-gray-600 text-sm">
                  Created By:{" "}
                  <span className="font-medium">{draft.created_by_name}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handleSendDraft(draft.id)}
                  disabled={draft.status === "sent"}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium ${
                    draft.status === "sent"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Send size={16} /> Send Draft
                </button>

                <button
                  onClick={() => setSelectedDraft(draft)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100 text-sm font-medium"
                >
                  <FileText size={16} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Modal Section */}
      <Modal
        isOpen={!!selectedDraft}
        onClose={() => setSelectedDraft(null)}
        title="Draft Details"
      >
        {selectedDraft && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md">
                <button
                    onClick={() => setSelectedDraft(null)}
                    className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
                    >
                    <X size={20} />
                </button>
                <div className="mb-4 text-sm">
                    <p>
                        <strong>Supplier:</strong> {selectedDraft.supplier_name}
                    </p>
                    <p>
                        <strong>Email:</strong> {selectedDraft.supplier_email}
                    </p>
                    <p>
                        <strong>Created By:</strong> {selectedDraft.created_by_name}
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
                        {selectedDraft.products?.map((p, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2 border">{p.product_name}</td>
                            <td className="p-2 border">{p.quantity}</td>
                            <td className="p-2 border">₹{p.price}</td>
                            <td className="p-2 border">₹{p.quantity * p.price}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>

                    <div className="text-right mt-3 mr-2 font-semibold">
                    Total: ₹
                    {selectedDraft.products?.reduce(
                        (sum, p) => sum + p.quantity * p.price,
                        0
                    )}
                </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CreateDraft;
