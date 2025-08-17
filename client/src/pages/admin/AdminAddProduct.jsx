/* eslint-disable no-empty */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/adminApiSlice";
import { useGetCategoriesQuery } from "../../redux/api/categoriesApiSlice";
import FloatingInput from "../../components/FloatingInput";
import BackButton from "../../components/BackButton";
import UploadFile from "../../components/UploadFile";
import { toast } from "react-toastify";

/* --------------------------- Tiny UI helpers --------------------------- */
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
const AdminAddProduct = () => {
  const navigate = useNavigate();

  // Data + mutations
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  // Form state
  // price is a STRING; stock is a NUMBER
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "", // string
    category: "",
    stock: 0, // number
    images: [], // File[]
    isFeatured: false,
  });

  /* ----------------------- Adapters for FloatingInput ----------------------- */
  // FloatingInput passes only the VALUE (not the event). These helpers adapt that.
  const setValue = (field) => (val) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const setNumber = (field) => (val) =>
    setFormData((prev) => ({
      ...prev,
      [field]: val === "" ? 0 : Number(val),
    }));

  /* ------------------------------ Native handlers ------------------------------ */
  // Keep using a normal event-based handler for native <select>, checkbox, etc.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ------------------------------ Images ------------------------------ */
  const handleFilesAdded = (newFiles) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const next = [...prev.images];
      next.splice(index, 1);
      return { ...prev, images: next };
    });
  };

  // Create object URLs for previews (Files only)
  const previewImages = useMemo(
    () =>
      formData.images.map((f) =>
        typeof f === "string" ? f : URL.createObjectURL(f)
      ),
    [formData.images]
  );

  // Revoke object URLs when previews change/unmount
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, [previewImages]);

  /* ------------------------------ Submit ------------------------------ */
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      brand: "",
      price: "",
      category: "",
      stock: 0,
      images: [],
      isFeatured: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!formData.category) return toast.error("Please select a category");

    // price is a STRING; allow integers or decimals w/ up to 2 places
    const priceStr = String(formData.price).trim();
    const priceOk = /^\d+(\.\d{1,2})?$/.test(priceStr);
    if (!priceOk) return toast.error("Enter a valid price (e.g., 19.99)");

    if (Number.isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      return toast.error("Enter a valid stock count");
    }

    try {
      // Build multipart/form-data
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("brand", formData.brand);
      fd.append("price", priceStr); // string
      fd.append("category", formData.category);
      fd.append("stock", String(formData.stock)); // number -> string
      fd.append("isFeatured", String(formData.isFeatured));
      formData.images.forEach((file) => fd.append("images", file));

      await createProduct(fd).unwrap();
      toast.success("Product created!");
      resetForm();
      navigate("/admin-panel/admin-products");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create product.");
    }
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <section className="max-w-5xl mx-auto p-6">
      <BackButton fallback="/admin-panel/admin-products" />

      {/* Header: title + featured badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Add New Product</h2>
        <FeaturedBadge value={formData.isFeatured} />
      </div>

      {/* Summary strip (mirrors Product Details page vibe) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Name</div>
            <div className="font-semibold truncate">{formData.name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Brand</div>
            <div className="font-semibold truncate">
              {formData.brand || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="font-semibold">
              {priceStrOrDash(formData.price)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Stock</div>
            <div className="font-semibold">
              {Number.isFinite(formData.stock) ? formData.stock : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        {/* These FloatingInputs pass only the VALUE; we adapt with setValue/setNumber */}
        <FloatingInput
          name="name"
          label="Name"
          value={formData.name}
          onChange={setValue("name")}
        />

        <FloatingInput
          name="description"
          label="Description"
          value={formData.description}
          onChange={setValue("description")}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FloatingInput
            name="brand"
            label="Brand"
            value={formData.brand}
            onChange={setValue("brand")}
          />

          {/* price stays STRING */}
          <FloatingInput
            name="price"
            label="Price"
            type="text"
            value={formData.price}
            onChange={setValue("price")}
          />

          {/* stock is NUMBER */}
          <FloatingInput
            name="stock"
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={setNumber("stock")}
          />
        </div>

        {/* Category select (native event-based) */}
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

        {/* Featured toggle (native event-based) */}
        <label className="inline-flex items-center gap-2 select-none">
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

          {previewImages.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {previewImages.map((src, i) => (
                <li key={i} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-28 object-cover rounded border"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center rounded-full w-7 h-7 bg-white/90 border text-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No images added yet.</p>
          )}

          {/* Your custom uploader (adds files to formData.images) */}
          <UploadFile onChange={handleFilesAdded} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            aria-busy={isCreating ? "true" : "false"}
          >
            {isCreating ? "Creating…" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={isCreating}
            className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
};

/* ------------------------------ Helpers ------------------------------ */
function priceStrOrDash(price) {
  const str = String(price ?? "");
  return str.trim() ? str : "—";
}

export default AdminAddProduct;
