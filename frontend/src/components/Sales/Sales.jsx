import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {X, Plus, Info, Trash2} from 'lucide-react'
import BillFromModal from '../BillFormModal/BillFromModal';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Sales() {
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    const [billSale, setBillSale] = useState(null);

  // Fetch all sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/orders"); 
      setSales(res.data.data.orders || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sale by ID
  const fetchSaleById = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/v1/order/${id}`);
      setSelectedSale(res.data.data);
    } catch (error) {
      console.error("Error fetching sale details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBill = async (id) => {
  try {
    setLoading(true);
    const res = await axios.get(`/api/v1/order/${id}`);
    setBillSale(res.data.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // generate pdf
  const generatePDF = (sale) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Invoice", 105, 20, { align: "center" });

    doc.setFontSize(12);
    // doc.text(`Invoice ID: ${sale.id}`, 20, 35);
    doc.text(`Date: ${new Date(sale.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, 20, 42);

    // Customer Info
    doc.text(`Customer: ${sale.customer_name}`, 20, 55);
    doc.text(`Phone: ${sale.phone}`, 20, 62);
    doc.text(`Address: ${sale.address}`, 20, 69);

    // Table (Products)
    const tableColumn = ["Item", "Rate", "Qty", "Total"];
    const tableRows = [];

    sale.items.forEach((item) => {
      const row = [
        item.product_name,
        `${item.price}/-`,
        item.quantity.toString(),
        `${item.price * item.quantity}/-`,
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [103, 58, 183] }, // purple header
      theme: "striped",
    });

    // Grand Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Amount: ${sale.total_amount}/-`, 190, finalY, { align: "right" });

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 105, finalY + 20, { align: "center" });

    doc.save(`Invoice_${sale.id}.pdf`);
  };

  const handleDeleteSale = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/v1/order/${selectedSale.id}`);
      alert('Sale deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedSale(null);
      fetchSales(); // Refresh the sales list
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Failed to delete sale');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="pt-30 pl-70 pr-6 pb-6 bg-gray-100 min-h-screen">

      <div className='flex flex-row justify-between mb-2 items-center'>
        <h1 className="text-2xl font-semibold ">Sales</h1>
        <button
            onClick={() => setShowOrder(true)}
            className="bg-purple-700 text-white px-4 mr-18  py-2 rounded-lg flex items-center gap-2 mb-2"
            >
            <Plus size={20} /> Create Bill
        </button>
      </div>
      

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-6 border-t border-gray-200 py-4">
          {sales.length > 0 ? (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="flex flex-col justify-between hover:shadow-lg bg-white rounded-lg shadow-md p-4 w-[22%] min-w-[250px]"
              >
                <div>
                  <p className="text-gray-800 text-sm">
                    <span className="font-medium">Customer:</span> {sale.customer_name}
                  </p>
                  <p className="text-gray-800 mt-1 text-sm">
                    <span className="font-medium">Phone:</span> {sale.phone}
                  </p>
                  <p className="text-md font-semibold text-green-700 mt-2 mb-2">
                    ₹{sale.total_amount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(sale.created_at).toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created by: {sale.created_by}
                  </p>
                </div>
                <div className='flex justify-between gap-2 mt-3'>
                  
                  <button
                    onClick={() => fetchBill(sale.id)}
                    className="px-3 py-1 cursor-pointer bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-sm font-medium"
                  >
                    Generate Bill
                  </button>
                  <button
                    onClick={() => fetchSaleById(sale.id)}
                    className='p-1 cursor-pointer rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium flex items-center justify-center transition'
                  >
                    <Info size={20}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No sales found</p>
          )}
        </div>
      )}


       {/* Sale Details Modal/Box */}
      {selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md">
            {/* Close Icon */}
            <button
              onClick={() => setSelectedSale(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
            >
              <X size={20} />
            </button>

            {/* Bill-style layout */}
            <div className="space-y-2">
              <p><strong>Customer:</strong> {selectedSale.customer_name}</p>
              <p><strong>Phone:</strong> {selectedSale.phone}</p>
              <p><strong>Address:</strong> {selectedSale.address}</p>

              {/* Items Section */}
              <div className="mt-6">
                <div className='flex items-center justify-between'>
                  <h3 className="text-md font-semibold mb-3">Items</h3>
                  <h3 className="text-md font-semibold mb-3">Rate</h3>
                  <h3 className="text-md font-semibold mb-3">Qty</h3>
                  <h3 className="text-md font-semibold mb-3">total</h3>
                </div>
                <div className="space-y-3">
                  {selectedSale.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-start text-sm border-b pb-2"
                    >
                      <span className="flex-1">{idx + 1}. {item.product_name}</span>
                      <span className="flex-1 ml-4">{item.price}</span>
                      <span className="w-16 text-center">{item.quantity}</span>
                      <span className="w-24 text-right font-medium">
                        ₹{item.quantity * item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              

              {/* Total */}
              <div className='flex items-center justify-end'>
                <p className="mt-6 text-lg font-bold">
                  <span className='mt-6 text-lg font-bold mr-6'>Total: </span>
                   ₹{selectedSale.total_amount}
                </p>
              </div>
            </div>

              {/* Delete Sale Button at bottom-left */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="absolute bottom-4 left-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Sale
              </button>
            
            
          </div>
        </div>
      )}

      {showOrder && (
        <BillFromModal
          onClose={() => setShowOrder(false)}
          onSuccess={fetchSales}
        />
      )}

      {billSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md">
            {/* Close Icon */}
            <button
              onClick={() => setBillSale(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-red-500 p-1 rounded"
            >
              <X size={20} />
            </button>

            {/* Bill Content */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold mb-2">Invoice</h2>
              <p><strong>Customer Name:</strong> {billSale.customer_name}</p>
              <p><strong>Phone:</strong> {billSale.phone}</p>
              <p><strong>Address:</strong> {billSale.address}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between border-b pb-2 font-semibold">
                  <span>Item</span>
                  <span>Rate</span>
                  <span>Qty</span>
                  <span>Total</span>
                </div>
                {billSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-start text-sm border-b pb-2">
                    <span className='flex-1'>{item.product_name}</span>
                    <span className='flex-1 ml-4'>₹{item.price}</span>
                    <span className='w-16 text-center'>{item.quantity}</span>
                    <span className='w-24 text-right font-medium'>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4 text-lg font-bold">
                Total: ₹{billSale.total_amount}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={() => generatePDF(billSale)}
              className="mt-4 w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg"
            >
              Download Bill
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this sale? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSale}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      
    </div>
  );
}

export default Sales