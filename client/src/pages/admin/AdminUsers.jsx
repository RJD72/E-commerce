import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useGetAllUsersQuery } from "../../redux/api/adminApiSlice";
import BackButton from "../../components/BackButton";

/* ------------------------- Small UI helpers ------------------------- */

// Role badge styles
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

// Status badge styles
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

// Utility: case-insensitive includes for filtering
const contains = (value, term) =>
  String(value || "")
    .toLowerCase()
    .includes(String(term || "").toLowerCase());

/* --------------------------- Main component --------------------------- */

const AdminUsers = () => {
  const navigate = useNavigate();

  // 1) Fetch all users (RTK Query). Keep API unchanged; we do client-side UX.
  const { data: usersRes, isLoading, error } = useGetAllUsersQuery();

  // Normalize list from your API shape (adjust if your field differs)
  const allUsers = usersRes?.data ?? [];

  // 2) Sort state (field + direction). Defaults are opinionated but sensible.
  const [sortBy, setSortBy] = useState("lastName"); // "lastName" | "firstName" | "email" | "role" | "status"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"

  // 3) Search state (debounced). We store `searchTerm` immediately and
  //    commit a debounced `query` after 300ms to avoid filtering on every keypress.
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setQuery(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // 4) Pagination state from URL (?page=2) so admins can share state via URL.
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 12;

  // 5) Sorting handler toggles direction if you click the same column
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // 6) Render arrow next to active sort column header
  const renderArrow = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  // 7) Filter -> Sort -> Paginate (all memoized for perf)
  const filteredUsers = useMemo(() => {
    if (!query) return allUsers;
    return allUsers.filter(
      (u) =>
        contains(u.firstName, query) ||
        contains(u.lastName, query) ||
        contains(u.email, query) ||
        contains(u.role, query) ||
        contains(u.status, query)
    );
  }, [allUsers, query]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];

    list.sort((a, b) => {
      // Safely select the field value being sorted
      const pick = (u) => {
        switch (sortBy) {
          case "firstName":
            return u.firstName || "";
          case "lastName":
            return u.lastName || "";
          case "email":
            return u.email || "";
          case "role":
            return (u.role || "").toLowerCase();
          case "status":
            return (u.status || "").toLowerCase();
          default:
            return u.lastName || ""; // sensible fallback
        }
      };

      let av = pick(a);
      let bv = pick(b);

      // Normalize to string for localeCompare (nice for mixed-case and diacritics)
      av = String(av);
      bv = String(bv);

      const cmp = av.localeCompare(bv, undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return list;
  }, [filteredUsers, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, safePage]);

  // Keep URL in sync if search reduces pages and current page becomes invalid
  useEffect(() => {
    if (safePage !== currentPage) {
      const p = new URLSearchParams(searchParams);
      p.set("page", String(safePage));
      setSearchParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  // Pagination controls update URL
  const goToPage = (pageNum) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", String(pageNum));
    setSearchParams(p);
    // Optional: scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------- Render States ---------------------------- */

  if (isLoading) return <div className="p-4">Loading users...</div>;
  if (error)
    return <div className="p-4 text-red-600">Error loading users.</div>;

  /* --------------------------------- UI --------------------------------- */

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin-panel" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
        <h2 className="text-2xl font-bold">All Users</h2>

        {/* Search input with debounce (filters by name/email/role/status) */}
        <div className="w-full sm:w-80">
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            type="text"
            placeholder="Search name, email, role, status…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Reset to page 1 when search changes
              const p = new URLSearchParams(searchParams);
              p.set("page", "1");
              setSearchParams(p, { replace: true });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ===== Mobile: Card list (below md) ===== */}
      <ul className="md:hidden space-y-3">
        {paginated.map((user) => (
          <li
            key={user._id}
            className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition cursor-pointer"
            onClick={() =>
              navigate(`/admin-panel/admin-users/details/${user._id}`)
            }
          >
            {/* Top row: Name + Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user.lastName}, {user.firstName}
                </div>
                <div className="mt-0.5 text-xs text-gray-500 font-mono truncate">
                  {user._id}
                </div>
              </div>
              <StatusBadge status={user.status} />
            </div>

            {/* Middle: Email */}
            <div className="mt-3">
              <div className="text-xs text-gray-500">Email</div>
              <Link
                to={`mailto:${user.email}`}
                onClick={(e) => e.stopPropagation()} // don't trigger card navigation
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {user.email}
              </Link>
            </div>

            {/* Bottom: Role */}
            <div className="mt-3">
              <div className="text-xs text-gray-500">Role</div>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ===== Desktop: Real table (md and up) ===== */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* Clickable headers toggle sort; arrow shows direction */}
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("lastName")}
                >
                  Last Name{renderArrow("lastName")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("firstName")}
                >
                  First Name{renderArrow("firstName")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  User ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("email")}
                >
                  Email{renderArrow("email")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("role")}
                >
                  Role{renderArrow("role")}
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
              {paginated.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/admin-panel/admin-users/details/${user._id}`)
                  }
                >
                  <td className="px-4 py-3">{user.lastName}</td>
                  <td className="px-4 py-3">{user.firstName}</td>
                  <td className="px-4 py-3 font-mono text-xs md:text-sm truncate max-w-[14rem]">
                    {user._id}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${user.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {user.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Pagination controls (shared) ===== */}
      {totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => goToPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
          >
            Prev
          </button>
          {/* For large datasets, consider a smarter pager; this simple one shows all pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`px-3 py-1 rounded border ${
                n === safePage ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => goToPage(n)}
              aria-current={n === safePage ? "page" : undefined}
            >
              {n}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default AdminUsers;
