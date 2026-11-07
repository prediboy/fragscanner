import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function PaginationControls({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 24,
  onPageChange,
  onPageSizeChange
}) {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate intelligent page numbers with ellipsis window
  const getPageNumbers = () => {
    const delta = 2; // Number of pages before and after current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handlePageSelect = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      // Smooth scroll back to top of grid
      const gridElem = document.getElementById('fragrance-grid-top');
      if (gridElem) {
        const topPos = gridElem.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pt-6 pb-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
      
      {/* Showing X-Y of Z & Page Size Selector */}
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-bold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-slate-900 dark:text-white font-bold">{totalItems.toLocaleString()}</strong> fragrances
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="hidden md:inline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 flex-wrap justify-center">
          
          {/* First Page Button */}
          <button
            onClick={() => handlePageSelect(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page Button */}
          <button
            onClick={() => handlePageSelect(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1 mx-1">
            {pageNumbers.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1 text-slate-400 select-none">
                    …
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={`page-${p}`}
                  onClick={() => handlePageSelect(p)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg font-mono text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => handlePageSelect(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page Button */}
          <button
            onClick={() => handlePageSelect(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

        </div>
      )}

    </div>
  );
}
