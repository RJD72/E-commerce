import { useState, useEffect } from "react";
import { useGetAllOrdersAdminQuery } from "../../redux/api/adminApiSlice";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

const columns = [
  { key: "_id", label: "Order ID" },
  { key: "user", label: "Customer" },
  { key: "createdAt", label: "Date" },
  { key: "isPaid", label: "Paid" },
  { key: "deliveredAt", label: "Delivered" },
  { key: "status", label: "Status" },
];

const badgeColor = (key, value) => {
  if (key === "isPaid")
    return value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  if (key === "status") {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[value] || "bg-gray-100 text-gray-800";
  }
};

const AdminOrders = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  const { data, isLoading, error } = useGetAllOrdersAdminQuery({
    sortBy,
    order,
    page,
    limit: 10,
    search: searchDebounced,
    status,
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setOrder("asc");
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  // Debounce search
  useEffect(() => {
    const debounced = debounce(() => setSearchDebounced(search), 500);
    debounced();
    return () => debounced.cancel();
  }, [search]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Orders</h1>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border rounded p-2 w-1/3"
          value={search}
          onChange={handleSearchChange}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {!isLoading && data?.orders && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="p-2 cursor-pointer border text-left"
                    >
                      {col.label}{" "}
                      {sortBy === col.key ? (order === "asc" ? "↑" : "↓") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() =>
                      navigate(
                        `/admin-panel/admin-orders/order-details/${order._id}`
                      )
                    }
                    className="border hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-2">{order._id}</td>
                    <td className="p-2">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="p-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-sm rounded ${badgeColor(
                          "isPaid",
                          order.isPaid
                        )}`}
                      >
                        {order.isPaid ? "Paid" : "Not Paid"}
                      </span>
                    </td>
                    <td className="p-2">
                      {order.deliveredAt
                        ? new Date(order.deliveredAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-sm rounded capitalize ${badgeColor(
                          "status",
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p>
              Page {data.page} of {data.pages}
            </p>
            <div className="space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === data.pages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
