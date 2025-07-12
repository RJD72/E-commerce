import { Link, useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "../../redux/api/productApiSlice";
import BackButton from "../../components/BackButton";
import { useEffect } from "react";

const AdminProducts = () => {
  const { data, isLoading, refetch } = useGetAllProductsQuery();
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin-panel" />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold my-4">All Products</h2>
        <div className="h-full">
          <Link to={"add-product"}>
            <button
              type="submit"
              className="p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
            >
              Add Product
            </button>
          </Link>
        </div>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Product Id</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Is Featured</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr
              key={item._id}
              className="hover:bg-gray-100 cursor-pointer transition duration-200"
              onClick={() =>
                navigate(`/admin-panel/admin-products/details/${item._id}`)
              }
            >
              <td className="border px-4 py-2">
                <img src={item.images[0]} alt="" className="h-12 " />
              </td>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">{item._id}</td>
              <td className="border px-4 py-2">${item.price}</td>
              <td className="border px-4 py-2">{item.stock}</td>
              <td className="border px-4 py-2">
                {item.isFeatured ? "True" : "False"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AdminProducts;
