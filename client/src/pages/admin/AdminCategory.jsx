import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "../../redux/api/categoriesApiSlice";
import FloatingInput from "../../components/FloatingInput";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";
import BackButton from "../../components/BackButton";
import EditCategoryModal from "../../components/EditCategoryModal";

/**
 * AdminCategory
 * - Cards on mobile, real table on desktop (consistent with your other admin pages)
 * - Keep add/edit/delete
 * - Add lightweight client-side search + pagination
 */
const AdminCategory = () => {
  // Data + mutations
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  // Create form
  const [name, setName] = useState("");

  // Modals / selection
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Search + pagination (client-side)
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const all = categories ?? [];
  const filtered = useMemo(() => {
    if (!debounced) return all;
    return all.filter((c) =>
      String(c?.name || "")
        .toLowerCase()
        .includes(debounced)
    );
  }, [all, debounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createCategory({ name: name.trim() }).unwrap();
      await refetch();
      toast.success("Category successfully added.");
      setName("");
      setPage(1);
    } catch (error) {
      const errorMsg =
        error?.data?.message || error?.error || "An unexpected error occurred";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("No category selected for deletion.");
      return;
    }
    try {
      const res = await deleteCategory({ id }).unwrap();
      toast.success(res.message || "Category deleted");
      await refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setSelectedCategoryId("");
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (newName) => {
    const trimmed = newName?.trim();
    if (!trimmed || !editingCategory?._id) return;

    try {
      await updateCategory({ id: editingCategory._id, name: trimmed }).unwrap();
      toast.success("Category updated");
      await refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Update failed");
    } finally {
      setShowEditModal(false);
      setEditingCategory(null);
    }
  };

  /* ----------------------------- Render ----------------------------- */

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <BackButton fallback="/admin-panel" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold">All Categories</h2>

        {/* Search */}
        <div className="w-full sm:w-80">
          <label htmlFor="category-search" className="sr-only">
            Search categories
          </label>
          <input
            id="category-search"
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ===== Mobile: Card list ===== */}
      <ul className="md:hidden mt-4 space-y-3">
        {isLoading && <li className="p-4">Loading…</li>}
        {isError && (
          <li className="p-4 text-red-600">Failed to load categories.</li>
        )}
        {!isLoading && !isError && paginated.length === 0 && (
          <li className="p-4 text-gray-600">No categories available.</li>
        )}
        {paginated.map((category) => (
          <li
            key={category._id}
            className="rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold capitalize truncate">
                  {category.name}
                </div>
                <div className="text-xs text-gray-500 font-mono truncate mt-1">
                  {category._id}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  title="Edit category"
                  onClick={() => handleEditClick(category)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <FaEdit className="text-blue-600" />
                </button>
                <button
                  title="Delete category"
                  onClick={() => {
                    setSelectedCategoryId(category._id);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <FaTrashCan className="text-red-600" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ===== Desktop: Real table ===== */}
      <div className="hidden md:block mt-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Category ID
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Edit
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading && (
                <tr>
                  <td className="px-4 py-3" colSpan={4}>
                    Loading…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td className="px-4 py-3 text-red-600" colSpan={4}>
                    Failed to load categories.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && paginated.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-600" colSpan={4}>
                    No categories available.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                paginated.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 capitalize">{category.name}</td>
                    <td className="px-4 py-3 font-mono text-xs md:text-sm truncate max-w-[18rem]">
                      {category._id}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        title="Edit category"
                        onClick={() => handleEditClick(category)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-gray-100"
                      >
                        <FaEdit className="text-blue-600" />
                        <span className="text-sm">Edit</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        title="Delete category"
                        onClick={() => {
                          setSelectedCategoryId(category._id);
                          setShowDeleteModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-gray-100"
                      >
                        <FaTrashCan className="text-red-600" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Pagination controls ===== */}
      {totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`px-3 py-1 rounded border ${
                n === safePage ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setPage(n)}
              aria-current={n === safePage ? "page" : undefined}
            >
              {n}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </nav>
      )}

      {/* ===== Create form ===== */}
      <form
        className="mt-8 flex flex-col sm:flex-row gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex-1">
          <FloatingInput
            name="addCategory"
            label="Add Category"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="sm:w-48 rounded-full bg-midnight-navy text-white font-semibold px-5 py-3 hover:bg-midnight-navy/90"
        >
          Add Category
        </button>
      </form>

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Category"
          message="Are you sure you want to delete this category?"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => handleDelete(selectedCategoryId)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditCategoryModal
          isOpen={showEditModal}
          initialValue={editingCategory?.name || ""}
          onCancel={() => setShowEditModal(false)}
          onConfirm={handleUpdateCategory}
        />
      )}
    </section>
  );
};

export default AdminCategory;
