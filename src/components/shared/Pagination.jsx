import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showFirstPage = visiblePages[0] > 1;
  const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;
  const showFirstEllipsis = visiblePages[0] > 2;
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  const handlePageClick = page => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const buttonBaseClasses =
    'flex items-center justify-center w-10 h-10 text-sm font-medium transition-all duration-200 rounded-lg border';
  const activeClasses = 'bg-orange-500 text-white border-orange-500 shadow-lg';
  const inactiveClasses =
    'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600';
  const disabledClasses = 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed';

  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(buttonBaseClasses, currentPage === 1 ? disabledClasses : inactiveClasses)}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {showPageNumbers && (
        <>
          {showFirstPage && (
            <>
              <button
                onClick={() => handlePageClick(1)}
                className={clsx(buttonBaseClasses, currentPage === 1 ? activeClasses : inactiveClasses)}
              >
                1
              </button>
              {showFirstEllipsis && <span className="text-gray-500 px-2">...</span>}
            </>
          )}

          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={clsx(buttonBaseClasses, currentPage === page ? activeClasses : inactiveClasses)}
            >
              {page}
            </button>
          ))}

          {showLastPage && (
            <>
              {showLastEllipsis && <span className="text-gray-500 px-2">...</span>}
              <button
                onClick={() => handlePageClick(totalPages)}
                className={clsx(buttonBaseClasses, currentPage === totalPages ? activeClasses : inactiveClasses)}
              >
                {totalPages}
              </button>
            </>
          )}
        </>
      )}

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(buttonBaseClasses, currentPage === totalPages ? disabledClasses : inactiveClasses)}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
