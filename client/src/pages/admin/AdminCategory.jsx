import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "../../redux/api/categoriesApiSlice";
import FloatingInput from "../../components/FloatingInput";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";
import BackButton from "../../components/BackButton";
import EditCategoryModal from "../../components/EditCategoryModal"; // Make sure this exists

const AdminCategory = () => {
  const { data: categories, isLoading, refetch } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [name, setName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory({ name }).unwrap();
      refetch();
      toast.success("Category successfully added.");
      setName("");
    } catch (error) {
      const errorMsg =
        error?.data?.message || error?.error || "An unexpected error occurred";
      toast.error(errorMsg);
      setName("");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("No category selected for deletion.");
      return;
    }

    try {
      const res = await deleteCategory({ id }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setSelectedCategoryId(null);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (newName) => {
    if (!newName || !editingCategory?._id) return;

    try {
      await updateCategory({ id: editingCategory._id, name: newName }).unwrap();
      toast.success("Category updated");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Update failed");
    } finally {
      setShowEditModal(false);
      setEditingCategory(null);
    }
  };

  return (
    <section className="">
      <div className="max-w-3xl mx-auto">
        <BackButton fallback="/admin-panel" />
        <h2 className="text-2xl font-bold my-6">All Categories</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Edit</th>
              <th className="px-4 py-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && categories?.length > 0 ? (
              categories.map((category) => (
                <tr
                  key={category._id}
                  className="hover:bg-gray-100 transition duration-200"
                >
                  <td className="capitalize border px-4 py-2">
                    {category.name}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    <span className="inline-block">
                      <FaEdit
                        color="blue"
                        onClick={() => handleEditClick(category)}
                        className="hover:scale-110 transition-transform duration-150 cursor-pointer"
                      />
                    </span>
                  </td>
                  <td className="cursor-pointer border px-4 py-2 text-right">
                    <span className="inline-block">
                      <FaTrashCan
                        color="red"
                        onClick={() => {
                          setSelectedCategoryId(category._id);
                          setTimeout(() => {
                            setShowDeleteModal(true);
                          }, 50);
                        }}
                        className="hover:scale-110 transition-transform duration-150 cursor-pointer"
                      />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No categories available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <form className="flex gap-10 mt-6">
          <FloatingInput
            name="addCategory"
            label="Add Category"
            value={name}
            onChange={handleChange}
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-1/3 rounded-full bg-midnight-navy text-white font-semibold hover:bg-midnight-navy/90 cursor-pointer"
          >
            Add Category
          </button>
        </form>
      </div>

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
