import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  rowsPerPage = 5,
  onRowsPerPageChange,
  totalItems = 0,
}) {
  // Ensure valid numbers
  const validTotalItems = Math.max(0, Number(totalItems));
  const validRowsPerPage = Math.max(1, Number(rowsPerPage));

  // Calculate range start and end
  const startItem =
    validTotalItems === 0 ? 0 : (currentPage - 1) * validRowsPerPage + 1;
  const endItem = Math.min(currentPage * validRowsPerPage, validTotalItems);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-end items-center mt-6 text-sm text-gray-700">
      {/* Pagination Container */}
      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
        
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Rows per page:</span>
          <select
            value={validRowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        {/* Range display */}
        <span className="text-gray-600 min-w-[120px] text-right">
          {validTotalItems === 0
            ? "0-0 of 0"
            : `${startItem}-${endItem} of ${validTotalItems}`}
        </span>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`p-2 rounded-md border transition ${
              currentPage === 1
                ? "bg-white text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`p-2 rounded-md border transition ${
              currentPage >= totalPages
                ? "bg-white text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
