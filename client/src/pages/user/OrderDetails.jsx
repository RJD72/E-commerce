import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetOrderByIdQuery } from "../../redux/api/orderApiSlice";
import BackButton from "../../components/BackButton";

/* --------------------------- Tiny UI helpers --------------------------- */
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
const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !order)
    return <div className="p-6 text-red-600">Failed to load order.</div>;

  const items = order.items || [];

  return (
    <section className="max-w-5xl mx-auto p-6">
      <BackButton fallback="/orders" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Order Details</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {/* If your API exposes isPaid, show a paid badge; otherwise hide it */}
          {typeof order.isPaid !== "undefined" && (
            <PaidBadge paid={order.isPaid} />
          )}
          <span className="text-xs text-gray-500">
            ID: <span className="font-mono">{order._id}</span>
          </span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between md:block">
            <div className="text-xs text-gray-500">Placed</div>
            <div className="font-semibold">{fmtDate(order.createdAt)}</div>
          </div>
          <div className="flex items-center justify-between md:block">
            <div className="text-xs text-gray-500">Status</div>
            <div className="font-semibold capitalize">{order.status}</div>
          </div>
          <div className="flex items-center justify-between md:block">
            <div className="text-xs text-gray-500">Total</div>
            <div className="font-bold">{fmtCurrency(order.totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
        <AddressBlock a={order.shippingAddress} />
      </div>

      {/* Items */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Items</h3>

        {/* Mobile: cards */}
        <ul className="md:hidden space-y-3">
          {items.map((item) => {
            const prod = item.product || {};
            const img = prod.images?.[0];
            const userReview = prod.reviews?.find?.(
              (r) =>
                r?.user &&
                user?._id &&
                r.user.toString?.() === user._id.toString()
            );

            return (
              <li
                key={prod._id || Math.random()}
                className="rounded-lg border border-gray-200 p-3 flex gap-3"
              >
                <img
                  src={img}
                  alt={prod.name}
                  className="w-16 h-16 object-cover rounded"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {prod.name}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Qty</div>
                      <div className="font-medium">{item.quantity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="font-medium">
                        {fmtCurrency(prod.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Subtotal</div>
                      <div className="font-medium">
                        {fmtCurrency(
                          Number(prod.price || 0) * Number(item.quantity || 0)
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Link
                      to={`/add-review/${prod._id}?orderId=${order._id}`}
                      className={`underline text-sm ${
                        userReview ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {userReview ? "Edit Review" : "Leave Review"}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop: table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Review
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => {
                  const prod = item.product || {};
                  const img = prod.images?.[0];
                  const userReview = prod.reviews?.find?.(
                    (r) =>
                      r?.user &&
                      user?._id &&
                      r.user.toString?.() === user._id.toString()
                  );

                  return (
                    <tr key={prod._id || Math.random()}>
                      <td className="px-4 py-3">
                        <img
                          src={img}
                          alt={prod.name}
                          className="w-16 h-16 object-cover rounded"
                          loading="lazy"
                        />
                      </td>
                      <td className="px-4 py-3">{prod.name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{fmtCurrency(prod.price)}</td>
                      <td className="px-4 py-3">
                        {fmtCurrency(
                          Number(prod.price || 0) * Number(item.quantity || 0)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/add-review/${prod._id}?orderId=${order._id}`}
                          className={`underline text-sm ${
                            userReview ? "text-green-600" : "text-blue-600"
                          }`}
                        >
                          {userReview ? "Edit Review" : "Leave Review"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Totals (optional separate card if you track tax/shipping later) */}
      <div className="mt-6 text-right">
        <span className="text-sm text-gray-600 mr-3">Order Total</span>
        <span className="text-lg font-bold">
          {fmtCurrency(order.totalAmount)}
        </span>
      </div>
    </section>
  );
};

export default OrderDetails;
