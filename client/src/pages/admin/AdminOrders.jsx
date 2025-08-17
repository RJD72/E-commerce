import { useState, useEffect, useMemo } from "react";
import { useGetAllOrdersAdminQuery } from "../../redux/api/adminApiSlice";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import BackButton from "../../components/BackButton";

/* ------------------------- Tiny UI helpers ------------------------- */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const PaidBadge = ({ paid }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      paid
        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
        : "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
    }`}
  >
    {paid ? "Paid" : "Not paid"}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    paid: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    shipped: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
    delivered: "bg-green-100 text-green-700 ring-1 ring-green-200",
    cancelled: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  };
  const cls =
    map[(status || "").toLowerCase()] ||
    "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}
    >
      {status || "—"}
    </span>
  );
};

/* ------------------------------ Component ------------------------------ */

const columns = [
  { key: "_id", label: "Order ID" },
  { key: "user", label: "Customer" },
  { key: "createdAt", label: "Date" },
  { key: "isPaid", label: "Paid" },
  { key: "deliveredAt", label: "Delivered" },
  { key: "status", label: "Status" },
];

const AdminOrders = () => {
  const navigate = useNavigate();

  // Server-side knobs (kept from your original)
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Debounced search term passed to API
  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const run = debounce(() => setSearchDebounced(search), 500);
    run();
    return () => run.cancel();
  }, [search]);

  const { data, isLoading, error, isFetching } = useGetAllOrdersAdminQuery({
    sortBy,
    order,
    page,
    limit: 10,
    search: searchDebounced,
    status,
  });

  const handleSort = (column) => {
    if (sortBy === column)
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1);
  };

  const orders = data?.orders ?? [];
  const pages = Math.max(1, data?.pages ?? 1);
  const currentPage = Math.min(page, pages);

  useEffect(() => {
    if (currentPage !== page) setPage(currentPage);
  }, [currentPage, page]);

  const arrow = (key) =>
    sortBy === key ? (order === "asc" ? " ▲" : " ▼") : "";

  // Memo so we don’t re-render card/table rows while typing into controls
  const list = useMemo(() => orders, [orders]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <BackButton fallback="/admin-panel" />
      <div className="flex items-end justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">
          All Orders{" "}
          {isFetching && (
            <span className="text-sm text-gray-500">(updating…)</span>
          )}
        </h1>

        <div className="flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or email…"
            className="border rounded px-3 py-2 text-sm w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading && <p>Loading orders…</p>}
      {error && <p className="text-red-500">Error loading orders.</p>}

      {!isLoading && !error && (
        <>
          {/* ================= MOBILE: stacked cards ================= */}
          <ul className="md:hidden space-y-3">
            {list.map((o) => (
              <li
                key={o._id}
                className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition cursor-pointer"
                onClick={() =>
                  navigate(`/admin-panel/admin-orders/order-details/${o._id}`)
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Order ID</div>
                    <div className="font-mono text-sm truncate">{o._id}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Customer</div>
                    <div className="text-sm truncate">
                      {o.user?.firstName} {o.user?.lastName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="text-sm">{fmtDate(o.createdAt)}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PaidBadge paid={o.isPaid} />
                  </div>
                  <div className="text-xs text-gray-500">
                    Delivered:{" "}
                    <span className="text-gray-800">
                      {fmtDate(o.deliveredAt)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* ================= DESKTOP: real table ================= */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                      >
                        {col.label}
                        {arrow(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {list.map((o) => (
                    <tr
                      key={o._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/admin-panel/admin-orders/order-details/${o._id}`
                        )
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs md:text-sm truncate max-w-[16rem]">
                        {o._id}
                      </td>
                      <td className="px-4 py-3">
                        {o.user?.firstName} {o.user?.lastName}
                      </td>
                      <td className="px-4 py-3">{fmtDate(o.createdAt)}</td>
                      <td className="px-4 py-3">
                        <PaidBadge paid={o.isPaid} />
                      </td>
                      <td className="px-4 py-3">{fmtDate(o.deliveredAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= Pagination ================= */}
          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-between">
              <p className="text-sm">
                Page <strong>{currentPage}</strong> of <strong>{pages}</strong>
              </p>
              <div className="space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;
