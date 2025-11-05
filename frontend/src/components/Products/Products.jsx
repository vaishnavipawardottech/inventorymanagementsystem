import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { Plus, Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import ProductFormModal from '../ProductFormModal/ProductFormModal';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  // filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const[productName, setProductName] = useState('');
  const[category, setCategory] = useState('');
  const[price, setPrice] = useState(0);
  const[stock, setStock] = useState("0");
  const[min_stock, setMin_stock] = useState("0");
  const[productImage, setProductImage] = useState(null);

  const [hoveredImage, setHoveredImage] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [open, setOpen] = useState(false);

  const options = [
    { value: "all", label: "Stock Status" },
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  const fetchProducts = async (pageNumber = 1, pageLimit = limit) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/products", {
        params: {
          page: pageNumber,
          limit: pageLimit,
          search: searchTerm || undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          stock_status: stockFilter !== "all" ? stockFilter : undefined,
        },
      });

      const { products, totalProducts, totalPages, currentPage } = res.data.data;
      setProducts(products);
      setTotalProducts(totalProducts);
      setTotalPages(totalPages);
      setPage(currentPage);
    } catch (error) {
      console.log("Error fetching products:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, categoryFilter, stockFilter]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/products/${id}`);
      fetchProducts(page, limit);
    } catch (error) {
      console.log("Error deleting product:", error);
    }
  };

  const handleAddProduct = async (formData) => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      await axios.post('/api/v1/add-product', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowModal(false);
      fetchProducts(page, limit);
    } catch (error) {
      console.log("Error adding product:", error);
    }
    setLoading(false);
  };
    const handleUpdateProduct = async (formData) => {
      if (!currentProduct) return;
      setLoading(true);
      try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
        });

        await axios.patch(`/api/v1/products/${currentProduct.id}`, data, {withCredentials: true,
          headers: {'Content-Type': 'multipart/form-data'}}
        );

        setShowModal(false);
        setEditMode(false);
        setCurrentProduct(null);
        fetchProducts(page, limit);

      } catch (error) {
        console.log("Error updating product:", error);
        
      }
      setLoading(false)
    }

    const handleDownload = () => {
      try {
        // prepare data for export (remove unwanted fields)
        const exportData = products.map(({id, name, category, price, stock, min_stock, stock_status})=> ({
          ID: id,
          Name: name,
          Category: category,
          Price: price,
          Stock: stock,
          "Min Stock": min_stock,
          "Stock Status": stock_status,
        }))

        // create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

        // generate buffer
        const excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});

        // save file
        const blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
        saveAs(blob, 'products.xlsx');
        
      } catch (error) {
        console.log("Error downloading file:", error);
      }
    }

  return (

      <>
        <div className="pt-30 pl-70 pr-6 pb-6 bg-gray-100 min-h-screen">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Products</h1>
            
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-3 justify-start">
            <div className="relative flex-1 w-full max-w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="border border-gray-200 pl-10 pr-3 py-2 rounded-lg w-full bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* stock status */}
            <div className='relative w-full max-w-56'>
              {/* Dropdown button */}
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center border border-gray-200 p-2 rounded-lg 
                          cursor-pointer bg-white hover:bg-gray-50 transition"
              >
                <span>
                  {options.find((o) => o.value === stockFilter)?.label || "Stock Status"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown menu */}
              {open && (
                <ul className="absolute left-0 mt-2 w-full bg-white border rounded-xl shadow-md z-10">
                  {options.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setStockFilter(opt.value);
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

            <button
              onClick={handleDownload}
              className="bg-white text-gray-700 px-4 py-2 ml-100 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Download
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-700 text-white px-4  py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} /> Add Product
            </button>
        </div>
          
          <div>
            <div className="border-t border-gray-200 mb-6"></div>
              {/* Products Cards */}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="flex flex-wrap gap-4 mt-3">
                {products.map((product) => (
                  <div key={product.id} className="w-[calc(25%-12px)]">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden relative hover:shadow-md transition-all h-96 flex flex-col">
                      {/* Image - 70% */}
                      <div className="relative h-[70%] bg-gray-100">
                        <img
                          src={product.image_url || "/vite.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition duration-300"
                        />
                      </div>

                      {/* Remaining content - 30% */}
                      <div className="h-[30%] flex flex-col justify-between bg-white relative">
                        {/* Stock status - top right, flush with edges */}
                        <span
                          className={`absolute top-0 right-0 px-3 py-2 rounded-bl-lg text-xs font-medium ${
                            product.stock_status === "in_stock"
                              ? "bg-green-100 text-green-600"
                              : product.stock_status === "low_stock"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {product.stock_status} ({product.stock})
                        </span>

                        {/* Edit button - bottom left */}
                        <button
                          onClick={() => {
                            setCurrentProduct(product);
                            setEditMode(true);
                            setShowModal(true);
                          }}
                          className="absolute bottom-2 left-2 text-xs text-gray-700 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          Edit
                        </button>

                        {/* Delete button - bottom right */}
                        <button
                          onClick={() => {
                            setProductToDelete(product.id);
                            setShowDeleteModal(true);
                          }}
                          className="absolute bottom-2 right-2 text-xs text-white px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </button>

                        <div className="px-4 pt-3 pb-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{product.category || '-'}</p>
                          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                          <p className="text-md font-bold mt-1 text-gray-900">₹{product.price}</p>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

            
          {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Delete Product</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this product?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete(productToDelete);
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        )}

        {showModal && (
          <ProductFormModal
            onClose={() => {
              setShowModal(false);
              setEditMode(false);
              setCurrentProduct(null);
            }}
            onSubmit={editMode ? handleUpdateProduct : handleAddProduct}
            initialData={editMode? currentProduct : null}
            editMode={editMode}
          />
        )}

        </div>
      </>



   
  )
}


export default Products;