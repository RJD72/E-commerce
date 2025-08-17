/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import {
  useGetOrderByIdAdminQuery,
  useUpdateOrderStatusMutation,
} from "../../redux/api/adminApiSlice";
import BackButton from "../../components/BackButton";
import { useMemo, useState } from "react";

/* --------------------------- Tiny UI helpers --------------------------- */
const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtCurrency = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(Number(n || 0));

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

const AddressBlock = ({ a }) => {
  if (!a) return <p className="text-sm text-gray-500">—</p>;
  return (
    <div className="text-sm">
      {a.street && <p>{a.street}</p>}
      <p>
        {[a.city, a.province].filter(Boolean).join(", ")}
        {a.postalCode ? ` ${a.postalCode}` : ""}
      </p>
      {a.country && <p>{a.country}</p>}
    </div>
  );
};

/* ------------------------------ Component ------------------------------ */

const AdminOrderDetails = () => {
  const { id } = useParams();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderByIdAdminQuery(id);

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [newStatus, setNewStatus] = useState("");

  const items = order?.items ?? [];

  const totals = useMemo(() => {
    // Safe subtotal based on item price * qty; fall back to order.totalAmount if needed
    const subtotal = items.reduce(
      (acc, it) =>
        acc + Number(it?.product?.price || 0) * Number(it?.quantity || 0),
      0
    );
    const total = Number(order?.totalAmount ?? subtotal);
    return { subtotal, total };
  }, [items, order?.totalAmount]);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    try {
      await updateOrderStatus({ id, status: newStatus }).unwrap();
      await refetch();
      setNewStatus("");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton fallback="/admin-panel/admin-orders" />
      <div className="flex items-end justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <div className="text-xs text-gray-500">
          Order ID: <span className="font-mono">{id}</span>
        </div>
      </div>

      {isLoading && <p>Loading order…</p>}
      {error && <p className="text-red-500">Error loading order details.</p>}

      {!!order && (
        <div className="space-y-8">
          {/* ===== Header summary ===== */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Customer</h2>
                <div className="text-sm">
                  <p className="font-medium">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                  <a
                    className="text-blue-600 hover:underline break-all"
                    href={`mailto:${order.user?.email}`}
                  >
                    {order.user?.email}
                  </a>
                </div>
              </div>

              {/* Order meta */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Order Info</h2>
                <dl className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Placed</dt>
                    <dd className="font-medium">
                      {fmtDateTime(order.createdAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Payment</dt>
                    <dd className="font-medium flex items-center gap-2">
                      <PaidBadge paid={order.isPaid} />
                      <span className="text-gray-500">•</span>
                      <span className="capitalize">
                        {order.paymentMethod || "—"}
                      </span>
                    </dd>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Paid At</dt>
                      <dd className="font-medium">
                        {fmtDateTime(order.paidAt)}
                      </dd>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Delivered</dt>
                      <dd className="font-medium">
                        {fmtDateTime(order.deliveredAt)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Status controls */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Status</h2>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="sr-only" htmlFor="status">
                    Change Status
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Change status…</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleStatusChange}
                    disabled={isUpdating || !newStatus}
                    className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
                    aria-busy={isUpdating ? "true" : "false"}
                  >
                    {isUpdating ? "Updating…" : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Addresses ===== */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
            <AddressBlock a={order.shippingAddress} />
          </section>

          {/* ===== Items: cards on mobile, table on desktop ===== */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Items</h2>

            {/* Mobile cards */}
            <ul className="md:hidden space-y-3">
              {items.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-gray-200 p-3 flex gap-3"
                >
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.product?.name}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="font-medium">
                          {fmtCurrency(item.product?.price)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Qty</div>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Subtotal</div>
                        <div className="font-medium">
                          {fmtCurrency(
                            Number(item.product?.price || 0) *
                              Number(item.quantity || 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <img
                            src={item.product?.images?.[0]}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded"
                            loading="lazy"
                          />
                        </td>
                        <td className="px-4 py-3">{item.product?.name}</td>
                        <td className="px-4 py-3">
                          {fmtCurrency(item.product?.price)}
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {fmtCurrency(
                            Number(item.product?.price || 0) *
                              Number(item.quantity || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ===== Summary ===== */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between sm:justify-start sm:gap-6">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {fmtCurrency(totals.subtotal)}
                  </span>
                </div>
                {/* If you track tax/shipping, add rows here */}
              </div>
              <div className="text-base">
                <span className="mr-3 font-semibold">Total:</span>
                <span className="font-bold">{fmtCurrency(totals.total)}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;
