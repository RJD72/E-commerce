/* eslint-disable no-unused-vars */
import { Link, useSearchParams } from "react-router-dom";

const Pagination = ({ currentPage, totalPages, keyword, filters }) => {
  const [searchParams] = useSearchParams();

  const getPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);

    // Add all active filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    params.append("page", pageNum);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex justify-center">
      <nav className="flex items-center gap-1">
        {currentPage > 1 && (
          <Link
            to={getPageUrl(currentPage - 1)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Previous
          </Link>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <Link
            key={number}
            to={getPageUrl(number)}
            className={`px-4 py-2 border rounded ${
              number === currentPage
                ? "bg-violet-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {number}
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link
            to={getPageUrl(currentPage + 1)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Pagination;
