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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-2 justify-start">
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
            className="bg-gray-300 text-black px-4 py-2 ml-96 rounded-lg hover:bg-gray-400"
          >
            Download
          </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-border rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-gray-200 border-b text-gray-600 uppercase text-sm">
              <tr>
                {/* <th className="p-4">ID</th> */}
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">edit</th>
                <th className="p-4">delete</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  {/* <td className="p-4">{product.id}</td> */}
                  <td className="p-3  relative">
                    <img
                      src={product.image_url || "/vite.svg"}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded cursor-pointer border"
                      onMouseEnter={() => setHoveredImage(product.image_url)}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                    {/* Hovered large image */}
                    {hoveredImage === product.image_url && (
                      <div className="absolute z-50 left-12 top-0 -translate-y-1/2 bg-white rounded shadow-lg border">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10xl h-25 object-cover"
                          style={{ pointerEvents: "none" }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{product.category || "-"}</td>
                  <td className="p-4">₹{product.price}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock_status === "in_stock"
                          ? "bg-green-100 text-green-600"
                          : product.stock_status === "low_stock"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.stock_status}
                    </span>
                  </td>
                  <td className='p-4'>
                      <button
                        onClick={() => {
                          setCurrentProduct(product)
                          setEditMode(true)
                          setShowModal(true)
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={18} />
                      </button>
                  </td>
                  <td className='p-4'>
                      <button
                        onClick={() => {
                          setProductToDelete(product.id);
                          setShowDeleteModal(true);
                        }
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="100%" className="">
                  <div className="flex items-center justify-end w-full">
                    {/* Pagination controls */}
                    <div className="flex items-center justify-end gap-3 w-full px-3 py-2 border-t border-gray-200">
                      {/* Rows per page */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <span>Rows per page:</span>
                        <select
                          value={limit}
                          onChange={(e) => {
                            setPage(1); // reset to first page
                            setLimit(Number(e.target.value));
                            fetchProducts(1, Number(e.target.value));
                          }}
                          className="border rounded px-1 py-1 text-sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                        </select>
                      </div>

                      {/* Range info */}
                      <div className="text-sm text-gray-600 ml-2 font-semibold">
                        {`${(page - 1) * limit + 1}–${Math.min(
                          page * limit,
                          totalProducts
                        )} of ${totalProducts}`}
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            if (page > 1) {
                              const prevPage = page - 1;
                              setPage(prevPage);
                              fetchProducts(prevPage, limit);
                            }
                          }}
                          disabled={page === 1 || loading}
                          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <ChevronLeft />
                        </button>

                        <button
                          onClick={() => {
                            if (page < totalPages) {
                              const nextPage = page + 1;
                              setPage(nextPage);
                              fetchProducts(nextPage, limit);
                            }
                          }}
                          disabled={page === totalPages || loading}
                          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

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