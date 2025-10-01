import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { Plus, Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
        }
      });

      const {products, totalProducts, totalPages, currentPage} = res.data.data;
      setProducts(products);
      setTotalProducts(totalProducts);
      setTotalPages(totalPages);
      setPage(currentPage);
      
    } catch (error) {
      console.log("Error fetching products:", error);
    }
    setLoading(false);
  }

  // fetch products
  useEffect(() => {
    fetchProducts(page, limit);
  }, [page, limit, searchTerm, categoryFilter, stockFilter]);

   

      const handleDelete = async (id) => {
          try {
            await axios.delete(`/api/v1/products/${id}`);
            fetchProducts(page, limit);
          } catch (error) {
            console.log("Error deleting product:", error);
          }
    }

    const handleAddProduct = async (formData) => {
      setLoading(true);
      try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
        })

        await axios.post('/api/v1/add-product', data,
           {withCredentials: true},
           {headers: {'Content-Type': 'multipart/form-data'}}
          );
        setShowModal(false);
        fetchProducts(page, limit);
        setLoading(false);
        
      } catch (error) {
        console.log("Error adding product:", error);
        
      }
    }

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
        <div className="ml-64 mt-16 mb-5 p-16 min-h-screen">

          {/* Header */}
          <div className="flex ml-10 justify-between items-center mb-6">
            {/* <h1 className="text-2xl font-bold">Products</h1> */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-700 text-white px-4  py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>

          {/* Filters */}
          <div className="flex ml-10 flex-col md:flex-row gap-4 mb-2 justify-start">
            <input
              type="text"
              placeholder="Search products..."
              className="border-2 p-2 rounded flex-1 w-full max-w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* stock status */}
            <div className='relative w-full max-w-56'>
              {/* Dropdown button */}
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center border p-2 rounded-full 
                          cursor-pointer hover:bg-gray-100 transition"
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
              className="bg-purple-200 text-black px-4 py-2 ml-80 rounded-lg hover:bg-purple-300"
            >
              Download
            </button>
        </div>
          
          <div className='mt-2 ml-10'>
            <div className="border-t border-gray-200 mb-6"></div>
              {/* Products Cards */}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="flex flex-wrap gap-6 mt-10">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col w-[30%] bg-white shadow-md border-t border-gray-100 overflow-hidden relative group rounded-2xl hover:shadow"
                  >
                    {/* Image section */}
                    <div className="relative flex-1 flex flex-col">
                      <img
                        src={product.image_url || "/vite.svg"}
                        alt={product.name}
                        className="w-full h-64 object-cover transition duration-300 group-hover:brightness-90"
                      />

                      {/* Info section (moved up) */}
                      <div className="absolute bottom-0 w-full bg-purple-200 bg-opacity-90 px-3 py-2 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                          <p className="text-sm text-gray-800">{product.category || "-"}</p>
                        </div>
                        <p className="text-lg font-bold text-black mt-1">₹{product.price}</p>
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setCurrentProduct(product);
                            setEditMode(true);
                            setShowModal(true);
                          }}
                          className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                        >
                          <Pencil size={18} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product.id);
                            setShowDeleteModal(true);
                          }}
                          className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Stock bar (moved down) */}
                    <div className="px-3 py-2 flex justify-between items-center border-t border-purple-300 bg-purple-200">
                      <span className="text-sm text-gray-800">
                        Stock: {product.stock}
                      </span>
                      <span
                        className={`px-1 py-1 rounded text-xs font-medium ${
                          product.stock_status === "in_stock"
                            ? "bg-green-100 text-green-600"
                            : product.stock_status === "low_stock"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.stock_status}
                      </span>
                    </div>
                  </div>

                ))}
              </div>
            )}
          </div>

            
          {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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