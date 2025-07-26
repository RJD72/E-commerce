import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/adminApiSlice";
import { useGetCategoriesQuery } from "../../redux/api/categoriesApiSlice";
import FloatingInput from "../../components/FloatingInput";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import UploadFile from "../../components/UploadFile"; // adjust path as needed

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [createProduct] = useCreateProductMutation();

  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    stock: "",
    images: [],
    isFeatured: false,
  });

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
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

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setPreviewImages((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append all regular fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("isFeatured", formData.isFeatured);

      // Append each file individually
      formData.images.forEach((file) => {
        formDataToSend.append("images", file); // Note: Same field name for all files
      });

      await createProduct(formDataToSend).unwrap();
      toast.success("Product created!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        brand: "",
        price: "",
        category: "",
        stock: "",
        images: [],
        isFeatured: false,
      });
      setPreviewImages([]);
      navigate("/admin-panel/admin-products");
    } catch (err) {
      console.error("Product creation error:", err);
      toast.error(
        err?.data?.message ||
          "Failed to create product. Check console for details."
      );
    }
  };

  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded p-6">
        <BackButton fallback="admin-products" />
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
                    {category.name}
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

          <div className="mt-6">
            <label className="block mb-2 font-medium">Upload Images</label>
            <UploadFile
              onChange={(newFiles) => {
                setFormData((prev) => ({
                  ...prev,
                  images: [...prev.images, ...newFiles],
                }));

                const previewUrls = newFiles.map((file) =>
                  URL.createObjectURL(file)
                );
                setPreviewImages((prev) => [...prev, ...previewUrls]);
              }}
            />
            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="h-24 w-full object-cover rounded shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
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
