/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/adminApiSlice";
import FloatingInput from "../../components/FloatingInput";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [createProduct] = useCreateProductMutation();
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    stock: undefined,
    images: [],
    isFeatured: false,
  });

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const fileArray = files ? Array.from(files) : [];
      setFormData((prev) => ({
        ...prev,
        [name]: fileArray,
      }));
      const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewImages(previewUrls);
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
      const payload = new FormData();
      for (const key in formData) {
        if (key === "images") {
          formData.images.forEach((file) => payload.append("images", file));
        } else {
          payload.append(key, formData[key]);
        }
      }

      const res = await createProduct(payload).unwrap();
      toast.success("Product created!");
      navigate("/admin-panel/admin-products");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create product.");
    }
  };

  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded p-6">
        <BackButton fallback="/admin-products" />
        <h2 className="text-2xl font-bold my-6">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <FloatingInput
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
          />
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
            <label className="block mb-2 font-medium">Upload Images</label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="h-24 object-cover rounded shadow"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Product
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminAddProduct;
