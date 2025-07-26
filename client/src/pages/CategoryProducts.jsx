import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetProductsByCategoryQuery } from "../redux/api/categoriesApiSlice";
import ProductCard from "../components/ProductCard";

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");

  // Map sort options to API parameters
  const getSortParams = () => {
    switch (sortOption) {
      case "priceHighToLow":
        return { sortBy: "price", order: "desc" };
      case "priceLowToHigh":
        return { sortBy: "price", order: "asc" };
      case "highestRatings":
        return { sortBy: "rating", order: "desc" };
      case "newest":
      default:
        return { sortBy: "createdAt", order: "desc" };
    }
  };

  const { sortBy, order } = getSortParams();

  const { data: response, isLoading } = useGetProductsByCategoryQuery({
    categoryId,
    page,
    limit: 12,
    sortBy,
    order,
  });

  if (isLoading) return <div>Loading...</div>;

  if (response.products.length === 0) {
    return (
      <section className="flex justify-center items-center bg-off-white-linen min-h-screen">
        <div>There are no products in this category.</div>
      </section>
    );
  }

  return (
    <section className="bg-off-white-linen py-8 px-2">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 capitalize">
          {response?.category?.name}
        </h2>

        {/* Sorting Dropdown */}
        <div className="mb-6">
          <label htmlFor="sort" className="mr-2 font-medium">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1); // Reset to first page when sorting changes
            }}
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-warm-taupe"
          >
            <option value="newest">Newest First</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="highestRatings">Highest Ratings</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {response?.products.map((item) => (
            <ProductCard
              key={item._id}
              id={item._id}
              image={item.images}
              name={item.name}
              price={item.price}
              brand={item.brand}
              rating={item.rating}
              numReviews={item.numReviews}
            />
          ))}
        </div>

        {/* Pagination */}
        {response?.pagination?.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from(
                { length: Math.min(5, response.pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (response.pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= response.pagination.totalPages - 2) {
                    pageNum = response.pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded border ${
                        page === pageNum ? "bg-warm-taupe text-white" : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(response.pagination.totalPages, p + 1)
                  )
                }
                disabled={page === response.pagination.totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryProducts;
