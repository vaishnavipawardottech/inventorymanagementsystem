import React, {useState} from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

function BillFromModal({onClose, onSuccess}) {
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState([{ product_id: "", product_name: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({}); // { index: [productList] }

  // Fetch product suggestions by name
  const fetchSuggestions = async (value, index) => {
      try {
        const res = await axios.get(`/api/v1/orders/search`,
           { params: { query: value || "" } }
        );

        const products = res.data?.data?.products || [];

        setSuggestions((prev) => ({
           ...prev,
          [index]: products
       }));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
  };

  // Add new empty row
  const addItemRow = () => {
    setItems([...items, { product_id: "", product_name: "", quantity: 1 }]);
  };

  // Select product from suggestions
  const selectProduct = (index, product) => {
    const newItems = [...items];
    newItems[index].product_id = product.id;
    newItems[index].product_name = product.name;
    setItems(newItems);

    setSuggestions((prev) => ({ ...prev, [index]: [] })); // clear suggestions
  };

  // Update row
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    if (field === "product_name") {
      newItems[index].product_id = ""; // reset product id if user is typing
      fetchSuggestions(value, index);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const validItems = items
      .filter((i) => i.product_id && i.quantity > 0)
      .map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));

    if (validItems.length === 0) {
      // alert("Please select at least one valid product before creating the bill.");
      setLoading(false);
      return;
    }

    await axios.post("/api/v1/create-order", {
      customer,
      items: validItems,
    });

    onSuccess();
    onClose();
  } catch (error) {
    console.error("Error while creating the bill: ", error);
    alert(error.response?.data?.message || "Failed to create bill");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-1"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Create Bill</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              className="border p-2 rounded"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              className="border p-2 rounded"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              required
            />
          </div>
          <textarea
            placeholder="Address"
            className="border p-2 rounded w-full"
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          />

          {/* Items Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Items</h3>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search Product"
                      className="border p-2 rounded flex-1 max-w-lg"
                      value={item.product_name}
                      onChange={(e) => updateItem(idx, "product_name", e.target.value)}
                      onFocus={() => fetchSuggestions("", idx)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      className="border p-2 rounded w-24"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      required
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {/* {suggestions[idx]?.length > 0 && (
                    <div className="absolute bg-white border mt-1 rounded shadow w-full max-h-40 overflow-y-auto z-10">
                      {suggestions[idx].map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectProduct(idx, product)}
                        >
                          {product.name} — ₹{product.price}
                        </div>
                      ))}
                    </div>
                  )} */}
                  <ul className="border rounded mt-1 max-w-lg bg-white">
                    {suggestions[idx]?.map((product) => (
                      <li
                        key={product.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() =>selectProduct(idx, product)} 
                      >
                        {product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 text-purple-600 hover:text-purple-800"
            >
              + Add Item
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Bill"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BillFromModal