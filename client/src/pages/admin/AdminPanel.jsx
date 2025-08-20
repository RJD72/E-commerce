import { useSelector } from "react-redux";
import { useGetUserQuery } from "../../redux/api/userApiSlice";
import { Outlet, useLocation } from "react-router-dom";
import FocusCard from "../../components/FocusCard";
import { adminCards } from "../../components/cardData/adminCards";
import BackButton from "../../components/BackButton";

/* --------------------------- Tiny UI helpers --------------------------- */
const Avatar = ({ src, alt }) => {
  const fallback = "https://via.placeholder.com/128x128.png?text=Admin";
  return (
    <img
      src={src || fallback}
      alt={alt || "Admin"}
      className="rounded-full w-20 h-20 border-4 border-indigo-800 object-cover shadow-md"
      loading="lazy"
    />
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="flex items-center justify-between md:block">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-semibold break-all">{value || "—"}</div>
  </div>
);

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/* ------------------------------ Component ------------------------------ */
const AdminPanel = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const isBaseAccountPage = location.pathname === "/admin-panel";

  const { data, error, isLoading } = useGetUserQuery(user._id);

  /* ------------------------------ States ------------------------------ */
  if (isLoading) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          Loading admin profile…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm text-center text-rose-700">
          Error: {error?.message || "Failed to load admin"}
        </div>
      </section>
    );
  }

  const u = data?.user || {};
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");

  return (
    <section className="max-w-6xl mx-auto p-6">
      {/* Header */}
      {isBaseAccountPage && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          {u._id && (
            <span className="text-xs text-gray-500">
              ID: <span className="font-mono">{u._id}</span>
            </span>
          )}
        </div>
      )}

      {/* Profile summary card */}
      {isBaseAccountPage && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <Avatar src={u.profileImage} alt={fullName || "Admin"} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 text-sm">
              <SummaryItem label="Name" value={fullName || u.email} />
              <SummaryItem label="Role" value="Admin" />
              <SummaryItem label="Member Since" value={fmtDate(u.createdAt)} />
            </div>
          </div>
        </div>
      )}

      {/* Admin actions */}
      {isBaseAccountPage && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Manage the Store</h2>
          <FocusCard cards={adminCards} />
        </div>
      )}

      {/* Nested admin routes (users, products, orders, etc.) */}
      <Outlet />
    </section>
  );
};

export default AdminPanel;
