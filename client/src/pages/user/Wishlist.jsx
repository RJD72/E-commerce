import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../../redux/api/wishlistApiSlice";
import { Link } from "react-router-dom";
import { useState } from "react";
import BackButton from "../../components/BackButton";

// Tiny helper so we don’t repeat loading state text in two places
const RemoveButton = ({ removing, onClick }) => (
  <button
    onClick={onClick}
    className="text-red-600 hover:underline disabled:opacity-50"
    disabled={removing}
    aria-busy={removing ? "true" : "false"}
  >
    {removing ? "Removing..." : "Remove"}
  </button>
);

const Wishlist = () => {
  const { data, isLoading, isError } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [removingId, setRemovingId] = useState(null);

  // Simple client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId).unwrap();
      // Optional: you could optimistically update cache via RTKQ if desired
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

  // Slice the current page items
  const totalPages = Math.ceil(data.wishlist.length / itemsPerPage);
  const paginatedItems = data.wishlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton fallback="/" />
      <h2 className="text-2xl font-bold my-6">My Wishlist</h2>

      {/* ===== Mobile: Card list (below md) ===== */}
      <ul className="md:hidden grid grid-cols-1 gap-3">
        {paginatedItems.map((product) => (
          <li
            key={product._id}
            className="flex gap-4 rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <Link
              to={`/product-details/${product._id}`}
              className="shrink-0"
              aria-label={`Go to ${product.name} details`}
            >
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
                loading="lazy"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                to={`/product-details/${product._id}`}
                className="text-base font-medium text-gray-900 hover:underline line-clamp-2"
              >
                {product.name}
              </Link>

              <div className="mt-3">
                <RemoveButton
                  removing={removingId === product._id}
                  onClick={() => handleRemove(product._id)}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ===== Desktop: Real table (md and up) ===== */}
      <div className="hidden md:block ">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-[0_5px_15px_rgba(0,0,0,0.35)]">
          <table className="min-w-full ">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  Image
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  Remove
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedItems.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-3">
                    <Link to={`/product-details/${product._id}`}>
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/product-details/${product._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <RemoveButton
                      removing={removingId === product._id}
                      onClick={() => handleRemove(product._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              aria-current={currentPage === index + 1 ? "page" : undefined}
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
