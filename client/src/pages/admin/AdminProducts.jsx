import { Link, useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "../../redux/api/productApiSlice";
import BackButton from "../../components/BackButton";
import { useEffect, useState } from "react";

const AdminProducts = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [isFeatured, setIsFeatured] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  const { data, isLoading, refetch } = useGetAllProductsQuery({
    page,
    limit,
    sortBy,
    order,
    isFeatured: isFeatured === "" ? undefined : isFeatured,
  });
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [page, limit, refetch]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin-panel" />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold my-4">All Products</h2>
        <div className="h-full">
          <Link to={"add-product"}>
            <button
              type="submit"
              className="p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
            >
              Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Items per page selector */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">Items per page:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded p-1"
          >
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border rounded p-1 ml-2"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div>
          <label className="mr-2">Is Featured:</label>
          <select
            value={isFeatured}
            onChange={(e) => setIsFeatured(e.target.value)}
            className="border rounded p-1"
          >
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </div>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Product Id</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Is Featured</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((item) => (
            <tr
              key={item._id}
              className="hover:bg-gray-100 cursor-pointer transition duration-200"
              onClick={() =>
                navigate(`/admin-panel/admin-products/details/${item._id}`)
              }
            >
              <td className="border px-4 py-2">
                <img src={item.images[0]} alt="" className="h-12 " />
              </td>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">{item._id}</td>
              <td className="border px-4 py-2">${item.price}</td>
              <td className="border px-4 py-2">{item.stock}</td>
              <td className="border px-4 py-2">
                {item.isFeatured ? "True" : "False"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {data?.pagination && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${
              page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Previous
          </button>

          <span>
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={page === data.pagination.totalPages}
            className={`px-4 py-2 rounded ${
              page === data.pagination.totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <label htmlFor="jumpPage">Jump to page:</label>
        <input
          id="jumpPage"
          type="number"
          min="1"
          max={data?.pagination?.totalPages}
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          className="border rounded px-2 py-1 w-20"
        />
        <button
          onClick={() => {
            const pageNum = Number(jumpPage);
            if (pageNum >= 1 && pageNum <= data.pagination.totalPages) {
              setPage(pageNum);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default AdminProducts;
