import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../../redux/api/wishlistApiSlice";
import { Link } from "react-router-dom";
import { useState } from "react";

const Wishlist = () => {
  const { data, isLoading, isError } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [removingId, setRemovingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId).unwrap();
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading)
    return <p className="text-center mt-10">Loading wishlist...</p>;
  if (isError || !data?.wishlist)
    return <p className="text-center mt-10">Failed to load wishlist.</p>;
  if (data.wishlist.length === 0)
    return <p className="text-center mt-10">Your wishlist is empty.</p>;

  // Pagination logic
  const totalPages = Math.ceil(data.wishlist.length / itemsPerPage);
  const paginatedItems = data.wishlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border-r border-gray-300">Image</th>
              <th className="text-left p-3 border-r border-gray-300">Name</th>
              <th className="text-left p-3">Remove</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((product) => (
              <tr key={product._id} className="border-t border-gray-300">
                <td className="p-3 border-r border-gray-300">
                  <Link to={`/product-details/${product._id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </Link>
                </td>
                <td className="p-3 border-r border-gray-300">
                  <Link
                    to={`/product-details/${product._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="text-red-600 hover:underline disabled:opacity-50"
                    disabled={removingId === product._id}
                  >
                    {removingId === product._id ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
