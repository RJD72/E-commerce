/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "../../redux/api/productApiSlice";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../redux/api/adminApiSlice";
import { useGetCategoriesQuery } from "../../redux/api/categoriesApiSlice";
import FloatingInput from "../../components/FloatingInput";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

const AdminProductDetails = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetProductByIdQuery(id);
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: 0,
    category: "",
    stock: 0,
    images: [],
    isFeatured: false,
  });

  // Sync product data into form state when loaded
  useEffect(() => {
    if (data) {
      // Deep clone to break reference to RTK Query cache
      const cloned = structuredClone(data);

      setFormData({
        name: data.name || "",
        description: data.description || "",
        brand: data.brand || "",
        price: data.price || 0,
        category: data.category || "",
        stock: data.stock || 0,
        images: data.images || [],
        isFeatured: data.isFeatured || false,
      });
    }
  }, [data]);

  // Handles input changes from all types (text, number, checkbox, file)
  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: Array.from(files),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProduct({ id, ...formData }).unwrap();

      toast.success("Product updated successfully.");
    } catch (error) {
      toast.error(error?.data?.message || "Update failed");
    }
  };

  const handleDeleteProduct = async () => {
    // Add deleteProduct mutation call here
    try {
      const res = await deleteProduct(id).unwrap();
      toast.success(res.message);
      navigate("admin-products");
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded p-6">
        <BackButton fallback="admin-panel" />
        <h2 className="text-2xl font-bold my-6">Product Details</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput label="Product Id" value={id} readOnly />
          <FloatingInput
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <FloatingInput
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <FloatingInput
            name="brand"
            label="Brand"
            value={formData.brand}
            onChange={handleChange}
          />
          <FloatingInput
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />
          <div className="relative mt-4">
            {categoriesLoading ? (
              <div>Loading categories...</div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-warm-taupe"
                required
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                    className="capitalize"
                  >
                    {category.name.charAt(0).toUpperCase() +
                      category.name.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <FloatingInput
            name="stock"
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
          />

          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              name="isFeatured"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <label htmlFor="isFeatured" className="font-medium">
              Featured
            </label>
          </div>

          <div className="mt-4">
            <label className="block mb-2 font-medium">Images</label>
            <div>
              {Array.isArray(data.images) &&
                data.images.every((img) => typeof img === "string") &&
                data.images.map((image, i) => (
                  <img
                    src={image}
                    alt={`Product image ${i}`}
                    className="h-24"
                    key={i}
                  />
                ))}
            </div>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Product
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {setShowDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            handleDeleteProduct();
          }}
        />
      )}
    </section>
  );
};

export default AdminProductDetails;
