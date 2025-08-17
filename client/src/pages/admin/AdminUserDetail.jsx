/* eslint-disable no-unused-vars */
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetUserByIdQuery,
  useToggleUserStatusMutation,
} from "../../redux/api/adminApiSlice";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import BackButton from "../../components/BackButton";

/* ----------------------------- UI helpers ----------------------------- */

// Role + Status badges for quick scanning
const RoleBadge = ({ role }) => {
  const cls =
    {
      admin: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
      manager: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
      user: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
    }[role?.toLowerCase()] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}
    >
      {role || "user"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const cls =
    {
      active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
      suspended: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
      pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    }[status?.toLowerCase()] ||
    "bg-gray-100 text-gray-700 ring-1 ring-gray-200";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}
    >
      {status || "active"}
    </span>
  );
};

// Defensive avatar placeholder
const Avatar = ({ src, alt }) => {
  const fallback = "https://via.placeholder.com/96x96.png?text=User"; // replace with your CDN placeholder
  return (
    <img
      src={src || fallback}
      alt={alt || "Profile"}
      className="w-24 h-24 rounded-full object-cover"
      loading="lazy"
    />
  );
};

// Friendly date format
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/* ---------------------------- Address block --------------------------- */

const AddressDisplay = ({ address }) => {
  // If you store addresses differently, update this guard & template
  if (!address || !address.street) {
    return <p className="text-sm text-gray-500">—</p>;
  }

  const line1 = [address.street].filter(Boolean).join(" ");
  const line2 = [address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(", ");
  const line3 = address.country;

  return (
    <div className="text-sm">
      <p>{line1}</p>
      <p>{line2}</p>
      {line3 && <p>{line3}</p>}
    </div>
  );
};

/* --------------------------- Main component --------------------------- */

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch user detail (+ orders on same payload per your API)
  const { data, isLoading, error } = useGetUserByIdQuery(id);

  // Toggle active/suspended (admin-only)
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();

  const user = data?.user;
  const orders = data?.orders || [];

  // Local status mirror so UI responds immediately after toggle
  const [userStatus, setUserStatus] = useState("");
  useEffect(() => {
    if (user?.status) setUserStatus(user.status);
  }, [user]);

  // ----- Order table state: sort + pagination (desktop/table & mobile/cards share it) -----
  const [sortBy, setSortBy] = useState("date"); // "date" | "status" | "id"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderArrow = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
    // yes, tiny, but users notice—and it saves headaches.
  };

  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      let av, bv;
      switch (sortBy) {
        case "id":
          av = a._id;
          bv = b._id;
          break;
        case "date":
          av = new Date(a.createdAt).getTime();
          bv = new Date(b.createdAt).getTime();
          break;
        case "status":
          av = (a.status || "").toLowerCase();
          bv = (b.status || "").toLowerCase();
          break;
        default:
          av = 0;
          bv = 0;
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [orders, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, safePage]);

  useEffect(() => {
    // if filtering/sorting changes order count, keep page in range
    if (safePage !== page) setPage(safePage);
  }, [safePage]); // eslint-disable-line

  const handleStatusChange = async () => {
    try {
      const res = await toggleStatus(id).unwrap();
      setUserStatus(res.newStatus); // immediate UI feedback
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status", {
        position: "top-center",
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  /* ------------------------------ Rendering ------------------------------ */

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) {
    const msg = error?.data?.message || error?.message || "Failed to load user";
    return <div className="p-6 text-red-600">Error: {msg}</div>;
  }
  if (!user) return <div className="p-6">User not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm space-y-8">
      <BackButton fallback="/admin-panel/admin-users" />

      {/* ===== Header: Avatar + basic info + badges + actions ===== */}
      <div className="flex items-start gap-6">
        <Avatar
          src={user.profileImage}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate">
            {user.firstName} {user.lastName}
          </h2>
          <div className="mt-1 text-sm text-gray-600 break-all">
            {user.email}
          </div>
          {user.phone && (
            <div className="text-sm text-gray-600">Phone: {user.phone}</div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge status={userStatus} />
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user.isVerified
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                  : "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
              }`}
              title={user.isVerified ? "Email verified" : "Email not verified"}
            >
              {user.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <button
            onClick={handleStatusChange}
            disabled={isToggling}
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-white transition disabled:opacity-60 ${
              (userStatus || "").toLowerCase() === "active"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
            aria-busy={isToggling ? "true" : "false"}
          >
            {isToggling
              ? "Updating…"
              : userStatus === "active"
              ? "Suspend User"
              : "Activate User"}
          </button>
        </div>
      </div>

      {/* ===== Account Info & Addresses ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-lg mb-2">Account Info</h3>
          <dl className="text-sm">
            <div className="flex justify-between py-1">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium capitalize">{user.role}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-gray-500">Verified</dt>
              <dd className="font-medium">{user.isVerified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize">{userStatus}</dd>
            </div>
            {user.createdAt && (
              <div className="flex justify-between py-1">
                <dt className="text-gray-500">Joined</dt>
                <dd className="font-medium">{fmtDate(user.createdAt)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="md:col-span-1">
          <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
          <div className="rounded-lg border border-gray-200 p-3">
            <AddressDisplay address={user.shippingAddress} />
          </div>
        </div>

        <div className="md:col-span-1">
          <h3 className="font-semibold text-lg mb-2">Billing Address</h3>
          <div className="rounded-lg border border-gray-200 p-3">
            <AddressDisplay address={user.billingAddress} />
          </div>
        </div>
      </div>

      {/* ===== Wishlist (simple list; link to PDP) ===== */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Wishlist</h3>
        {Array.isArray(user.wishList) && user.wishList.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.wishList.map((item) => (
              <li
                key={item.productId}
                className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition"
              >
                <a
                  className="block text-sm font-mono text-blue-700 hover:underline break-all"
                  href={`/product-details/${item.productId}`}
                  title="View product"
                >
                  {item.productId}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No wishlist items.</p>
        )}
      </div>

      {/* ===== Order History: cards on mobile, table on desktop ===== */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Order History</h3>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-600">No orders placed.</p>
        ) : (
          <>
            {/* Mobile: stacked order cards */}
            <ul className="md:hidden space-y-3">
              {paginatedOrders.map((order) => (
                <li
                  key={order._id}
                  className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition cursor-pointer"
                  onClick={() => navigate(`/admin-panel/orders/${order._id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Order ID</div>
                      <div className="font-mono text-sm truncate">
                        {order._id}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="text-sm">{fmtDate(order.createdAt)}</div>
                    </div>
                    {/* If you have totals, you can show them here */}
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: real table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => handleSort("id")}
                      >
                        Order ID{renderArrow("id")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => handleSort("date")}
                      >
                        Date{renderArrow("date")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => handleSort("status")}
                      >
                        Status{renderArrow("status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          navigate(`/admin-panel/orders/${order._id}`)
                        }
                      >
                        <td className="px-4 py-3 font-mono text-xs md:text-sm truncate max-w-[16rem]">
                          {order._id}
                        </td>
                        <td className="px-4 py-3">
                          {fmtDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sorting controls hint + Pagination */}
            <div className="mt-3 text-xs text-gray-500">
              Tip: click column headers to sort.
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-4 flex items-center justify-center gap-2"
                aria-label="Pagination"
              >
                <button
                  className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      className={`px-3 py-1 rounded border ${
                        n === safePage
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setPage(n)}
                      aria-current={n === safePage ? "page" : undefined}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail;
