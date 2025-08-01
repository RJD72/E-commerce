import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchProductsQuery } from "../redux/api/productApiSlice";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const page = searchParams.get("page") || 1;

  // Filter and sort state
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    brand: searchParams.get("brand") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    order: searchParams.get("order") || "desc",
  });

  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useSearchProductsQuery(
    {
      keyword,
      page: Number(page),
      ...filters,
    },
    { skip: !keyword }
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      brand: "",
      sortBy: "createdAt",
      order: "desc",
    });
    setSearchParams({ keyword });
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (isError)
    return (
      <div className="text-red-500 text-center py-8">
        Error: {error?.data?.message || error?.error}
      </div>
    );
  if (!searchData?.products?.length)
    return <div className="text-center py-8">No products found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Filters</h3>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home</option>
                {/* Add more categories as needed */}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                placeholder="Brand name"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
              <select
                name="order"
                value={filters.order}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded mt-2"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 flex-1"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">
            Search Results for "{keyword}" ({searchData.totalProducts} items)
          </h2>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchData.products.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                image={product.images}
                name={product.name}
                price={product.price}
                brand={product.brand}
                rating={product.rating}
                numReviews={product.numReviews}
              />
            ))}
          </div>

          {/* Pagination */}
          {searchData.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={searchData.currentPage}
                totalPages={searchData.totalPages}
                keyword={keyword}
                filters={filters}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
