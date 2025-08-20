import { useSelector } from "react-redux";
import { useGetUserQuery } from "../../redux/api/userApiSlice";
import { Outlet, useLocation } from "react-router-dom";
import FocusCard from "../../components/FocusCard";
import { userCards } from "../../components/cardData/userCards";
import BackButton from "../../components/BackButton";

/* --------------------------- Tiny UI helpers --------------------------- */
const Avatar = ({ src, alt }) => {
  const fallback = "https://via.placeholder.com/128x128.png?text=User";
  return (
    <img
      src={src || fallback}
      alt={alt || "Profile"}
      className="rounded-full w-24 h-24 border-4 border-indigo-800 object-cover shadow-md"
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
const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const isBaseAccountPage = location.pathname === "/profile";

  const { data, error, isLoading } = useGetUserQuery(user._id, {
    refetchOnMountOrArgChange: true,
  });

  /* ------------------------------ States ------------------------------ */
  if (isLoading) {
    return (
      <section className="max-w-5xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          Loading user profile…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-5xl mx-auto p-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm text-center text-rose-700">
          Error: {error?.message || "Failed to load profile"}
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
          <h1 className="text-2xl font-bold">
            Welcome{fullName ? `, ${fullName}` : ""}
          </h1>
          {u._id && (
            <span className="text-xs text-gray-500">
              ID: <span className="font-mono">{u._id}</span>
            </span>
          )}
        </div>
      )}

      {/* Profile Card */}
      {isBaseAccountPage && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <Avatar src={u.profileImage} alt={fullName || "Profile"} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 text-sm">
              <SummaryItem label="Name" value={fullName} />
              <SummaryItem label="Email" value={u.email} />
              <SummaryItem label="Member Since" value={fmtDate(u.createdAt)} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions / Focus Areas */}
      {isBaseAccountPage && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Manage Your Account</h2>
          <FocusCard cards={userCards} />
        </div>
      )}

      {/* Nested routes (e.g., Contact Info, Addresses, Orders, etc.) */}
      <Outlet />
    </section>
  );
};

export default Profile;
