import { Link, useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "../../redux/api/productApiSlice";
import BackButton from "../../components/BackButton";
import { useEffect, useMemo, useState } from "react";

/* ------------------------- Small UI helpers ------------------------- */

// Currency formatter (CAD by default—switch if needed)
const fmtCurrency = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(n);

// Visual badge for Featured/Not Featured
const FeaturedBadge = ({ value }) => {
  const yes = "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  const no = "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        value ? yes : no
      }`}
    >
      {value ? "Featured" : "Not featured"}
    </span>
  );
};

/* --------------------------- Main component --------------------------- */

const AdminProducts = () => {
  // Server-driven knobs (these go to your RTKQ query)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt"); // "createdAt" | "name"
  const [order, setOrder] = useState("desc"); // "asc" | "desc"
  const [isFeatured, setIsFeatured] = useState(""); // "", "true", "false"

  // Local UI only
  const [jumpPage, setJumpPage] = useState("");
  const navigate = useNavigate();

  // Ask the API for products with the current knobs.
  // NOTE: RTK Query will refetch automatically when any arg changes.
  const { data, isLoading, isError, refetch, isFetching } =
    useGetAllProductsQuery({
      page,
      limit,
      sortBy,
      order,
      isFeatured: isFeatured === "" ? undefined : isFeatured,
    });

  // Optional: if you *also* want a manual refetch on page/limit changes.
  // You don’t strictly need this because RTKQ re-queries when args change,
  // but it doesn’t hurt. Keep or remove per preference.
  useEffect(() => {
    refetch();
  }, [page, limit, sortBy, order, isFeatured, refetch]);

  // Derived data with safe defaults
  const products = data?.data ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  };

  // In case you want a quick client-side “badge search” in future, here’s the memo.
  const memoProducts = useMemo(() => products, [products]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError)
    return <div className="p-4 text-red-600">Failed to load products.</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin-panel" />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold my-6">
          All Products
          {isFetching && (
            <span className="ml-3 text-sm text-gray-500">(updating…)</span>
          )}
        </h2>
        <div className="h-full">
          <Link to={"add-product"}>
            <button
              type="button"
              className="p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
            >
              Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Controls row */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        {/* Items per page */}
        <div className="flex items-center">
          <label className="mr-2 text-sm">Items per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // reset to first page when page size changes
            }}
            className="border rounded px-2 py-1"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
          </select>
          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* isFeatured filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Is Featured:</label>
          <select
            value={isFeatured}
            onChange={(e) => {
              setIsFeatured(e.target.value); // "", "true", "false"
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </div>
      </div>

      {/* ===================== Mobile view: product cards ===================== */}
      <ul className="md:hidden grid grid-cols-1 gap-3">
        {memoProducts.map((item) => (
          <li
            key={item._id}
            className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition cursor-pointer"
            onClick={() =>
              navigate(`/admin-panel/admin-products/details/${item._id}`)
            }
          >
            <div className="flex gap-4">
              <img
                src={item.images?.[0]}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {item.name}
                  </h3>
                  <FeaturedBadge value={item.isFeatured} />
                </div>
                <div className="mt-1 text-xs text-gray-500 break-all font-mono">
                  {item._id}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="text-sm font-medium">
                      {fmtCurrency(item.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Stock</div>
                    <div className="text-sm font-medium">{item.stock}</div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ===================== Desktop view: real table ===================== */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Image
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Product ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Featured
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {memoProducts.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/admin-panel/admin-products/details/${item._id}`)
                  }
                >
                  <td className="px-4 py-3">
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs md:text-sm truncate max-w-[16rem]">
                    {item._id}
                  </td>
                  <td className="px-4 py-3">{fmtCurrency(item.price)}</td>
                  <td className="px-4 py-3">{item.stock}</td>
                  <td className="px-4 py-3">
                    <FeaturedBadge value={item.isFeatured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== Pagination controls ===================== */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded border ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            <span className="text-sm">
              Page <strong>{pagination.currentPage}</strong> of{" "}
              <strong>{pagination.totalPages}</strong> — {pagination.totalCount}{" "}
              total
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className={`px-4 py-2 rounded border ${
                page === pagination.totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>

          {/* Jump to page */}
          <div className="flex items-center gap-2">
            <label htmlFor="jumpPage" className="text-sm">
              Jump to page:
            </label>
            <input
              id="jumpPage"
              type="number"
              min="1"
              max={pagination.totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="border rounded px-2 py-1 w-24"
            />
            <button
              onClick={() => {
                const pageNum = Number(jumpPage);
                if (
                  !Number.isNaN(pageNum) &&
                  pageNum >= 1 &&
                  pageNum <= pagination.totalPages
                ) {
                  setPage(pageNum);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
