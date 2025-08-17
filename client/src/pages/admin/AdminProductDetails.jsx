/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
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

/* --------------------------- Tiny UI helpers --------------------------- */
const fmtCurrency = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
  }).format(Number(n || 0));

const FeaturedBadge = ({ value }) => {
  const yes = "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  const no = "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        value ? yes : no
      }`}
    >
      {value ? "Featured" : "Not featured"}
    </span>
  );
};

/* ------------------------------ Component ------------------------------ */
const AdminProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Queries / mutations
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductByIdQuery(id);
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Controlled form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: 0,
    category: "",
    stock: 0,
    images: [], // can be strings (existing URLs) or File objects (new uploads)
    isFeatured: false,
  });

  // Mirror product data into form when it loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        price: Number(product.price || 0),
        category: product.category || "",
        stock: Number(product.stock || 0),
        images: Array.isArray(product.images) ? product.images : [],
        isFeatured: !!product.isFeatured,
      });
    }
  }, [product]);

  // Derive a preview list for images (URLs for strings; object URLs for Files)
  const imagePreviews = useMemo(() => {
    if (!Array.isArray(formData.images)) return [];
    return formData.images.map((img) => {
      if (typeof img === "string") return img;
      try {
        return URL.createObjectURL(img); // File/Blob
      } catch {
        return "";
      }
    });
  }, [formData.images]);

  // Input handler for text, number, checkbox, file
  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        // merge with existing string URLs so you can add images instead of losing old ones
        images: [...(prev.images || []), ...Array.from(files || [])],
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeExistingImage = (idx) => {
    setFormData((prev) => {
      const next = [...prev.images];
      next.splice(idx, 1);
      return { ...prev, images: next };
    });
  };

  // Decide whether to send JSON or FormData (if any File present)
  const hasNewFiles = useMemo(
    () =>
      Array.isArray(formData.images) &&
      formData.images.some((i) => typeof i !== "string"),
    [formData.images]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload;

      if (hasNewFiles) {
        // Build multipart/form-data
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("description", formData.description);
        fd.append("brand", formData.brand);
        fd.append("price", String(formData.price));
        fd.append("category", formData.category);
        fd.append("stock", String(formData.stock));
        fd.append("isFeatured", String(formData.isFeatured));

        // Separate string URLs and Files so the backend can preserve existing URLs if desired
        const existingUrls = formData.images.filter(
          (i) => typeof i === "string"
        );
        existingUrls.forEach((url) => fd.append("existingImageUrls[]", url));

        const newFiles = formData.images.filter((i) => typeof i !== "string");
        newFiles.forEach((file) => fd.append("images", file));

        payload = fd;
      } else {
        // JSON update (no new files)
        payload = {
          name: formData.name,
          description: formData.description,
          brand: formData.brand,
          price: formData.price,
          category: formData.category,
          stock: formData.stock,
          images: formData.images, // string URLs
          isFeatured: formData.isFeatured,
        };
      }

      await updateProduct({
        id,
        ...(hasNewFiles ? { body: payload } : payload),
      }).unwrap();
      toast.success("Product updated successfully.");
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await deleteProduct(id).unwrap();
      toast.success(res?.message || "Product deleted");
      navigate("/admin-panel/admin-products");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    } finally {
      setShowDeleteModal(false);
    }
  };

  /* ------------------------------ Render ------------------------------ */

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        Error: {error?.message || "Failed to load"}
      </div>
    );
  if (!product) return <div className="p-6">Product not found.</div>;

  return (
    <section className="max-w-5xl mx-auto p-6">
      <BackButton fallback="/admin-panel/admin-products" />

      {/* Header: name + id + badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">
          {product.name || "Product Details"}
        </h2>
        <div className="flex items-center gap-3">
          <FeaturedBadge value={formData.isFeatured} />
          <span className="text-xs text-gray-500">
            ID: <span className="font-mono">{id}</span>
          </span>
        </div>
      </div>

      {/* Summary card (price/stock/brand/category) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="font-semibold">{fmtCurrency(product.price)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Stock</div>
            <div className="font-semibold">{product.stock}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Brand</div>
            <div className="font-semibold">{product.brand || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Category</div>
            <div className="font-semibold break-all">
              {categoriesLoading
                ? "Loading…"
                : categories?.find?.((c) => c._id === (product.category || ""))
                    ?.name ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <FloatingInput label="Product ID" value={id} readOnly />

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <FloatingInput
            name="stock"
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
          />
        </div>

        {/* Category select */}
        <div className="relative">
          {categoriesLoading ? (
            <div className="text-sm text-gray-600">Loading categories…</div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories?.map?.((category) => (
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

        {/* Featured toggle */}
        <label className="inline-flex items-center gap-2 select-none mt-2">
          <input
            type="checkbox"
            name="isFeatured"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
          />
          <span className="font-medium">Featured</span>
        </label>

        {/* Image gallery + uploader */}
        <div className="mt-2">
          <label className="block mb-2 font-medium">Images</label>

          {/* Preview grid */}
          {imagePreviews?.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {imagePreviews.map((src, i) => (
                <li key={i} className="relative group">
                  <img
                    src={src}
                    alt={`Product image ${i + 1}`}
                    className="w-full h-28 object-cover rounded border"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center rounded-full w-7 h-7 bg-white/90 border text-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No images yet.</p>
          )}

          {/* File input (can add more on top of existing URLs) */}
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            aria-busy={isUpdating ? "true" : "false"}
          >
            {isUpdating ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            aria-busy={isDeleting ? "true" : "false"}
          >
            {isDeleting ? "Deleting…" : "Delete Product"}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </section>
  );
};

export default AdminProductDetails;
