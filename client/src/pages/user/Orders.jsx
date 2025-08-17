import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import Pagination from "../../components/Pagination";
import BackButton from "../../components/BackButton";

// Optional helpers for consistent formatting
const fmtCurrency = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(n);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Simple status badge (tweak colors to your palette)
const StatusBadge = ({ status }) => {
  const map = {
    paid: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    processing: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    shipped: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
    delivered: "bg-green-100 text-green-700 ring-1 ring-green-200",
    cancelled: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    pending: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };
  const cls = map[status?.toLowerCase()] || map.pending;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}
    >
      {status || "pending"}
    </span>
  );
};

const Orders = () => {
  const { data: orders, isLoading, isError } = useGetMyOrdersQuery();
  const navigate = useNavigate();

  // Sorting state mirrors your original approach
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Read pagination from querystring (?page=2) to keep URL-shareable
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  // Toggle sort or change field
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Compute sorted orders once per dependency change
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "id":
          aValue = a._id;
          bValue = b._id;
          break;
        case "date":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "total":
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case "item":
          aValue = a.items[0]?.product?.name || "";
          bValue = b.items[0]?.product?.name || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderArrow = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  if (isLoading) return <div className="p-4">Loading orders...</div>;
  if (isError)
    return <div className="p-4 text-red-600">Failed to load orders.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton fallback="/" />
      <h2 className="text-2xl font-bold my-6">My Orders</h2>

      {paginatedOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <>
          {/* ===== Mobile: Card list (visible below md) ===== */}
          <ul className="md:hidden space-y-3">
            {paginatedOrders.map((order) => (
              <li
                key={order._id}
                className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition cursor-pointer"
                onClick={() =>
                  navigate(`/profile/orders/order-details/${order._id}`)
                }
              >
                {/* Top row: ID + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Order ID</div>
                    <div className="font-mono text-sm truncate">
                      {order._id}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Middle: Date + Total */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="text-sm">{fmtDate(order.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-sm font-semibold">
                      {fmtCurrency(order.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Bottom: Name */}
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-sm">
                    {order.items[0]?.product?.name || "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* ===== Desktop: Real table (visible from md up) ===== */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-[0_5px_15px_rgba(0,0,0,0.35)]">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      Order ID{renderArrow("id")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date{renderArrow("date")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                      onClick={() => handleSort("total")}
                    >
                      Total{renderArrow("total")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                      onClick={() => handleSort("item")}
                    >
                      Name{renderArrow("item")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(`/profile/orders/order-details/${order._id}`)
                      }
                    >
                      <td className="px-4 py-3 font-mono text-sm">
                        {order._id}
                      </td>
                      <td className="px-4 py-3">{fmtDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        {fmtCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        {order.items[0]?.product?.name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination stays shared for both views */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              keyword={null}
              filters={{}}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
