import React, {useState} from 'react'
import { Package, X } from 'lucide-react';

function ProductFormModal({onClose, onSubmit, initialData = null, editMode = false}) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        category: initialData?.category || '',
        price: initialData?.price || '',
        stock: initialData?.stock || '',
        min_stock: initialData?.min_stock || '',
        image: null,
    });

    const handleChange = (e) => {
        const {name, value, files} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    }

    const handleRemoveImage = () => {
      setFormData((prev) => ({
        ...prev,
        image: null,
      }))
    }
  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        
        {/* Inventory header with icon */}
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        </div>

        <h2 className="text-lg font-semibold mb-4">{editMode ? "Edit Product" : "Add product"}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Floating label input */}
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="Product name"
            />
          </div>

          {/* Category input instead of select */}
          <div className="relative">
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="peer w-full border p-2 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="category (e.g., food, grocery)"
            />
            
          </div>

          {/* Price */}
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full border p-2 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="Price"
            />
          </div>

          {/* Stock */}
          <div className="relative">
            <input
              type="text"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="Stock (e.g., 10kg)"
            />
          </div>

          {/* Min Stock */}
          <div className="relative">
            <input
              type="text"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="Minimum Stock (e.g., 5kg)"
            />
          </div>

          {/* Image Upload */}
          <div className="relative">
            {!formData.image ? (
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full border p-2 rounded cursor-pointer"
              />
            ) : (
              <div className="flex items-center justify-between border p-2 rounded bg-gray-50">
                <span className="text-gray-700 text-sm truncate max-w-[85%]">
                  {formData.image.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black font-semibold rounded-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 font-semibold bg-indigo-600 text-white rounded-sm hover:bg-indigo-700"
            >
              {editMode ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal