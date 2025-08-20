import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchProductsQuery } from "../redux/api/productApiSlice";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const page = searchParams.get("page") || 1;

  // Filter and sort state (same params as before)
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

  /* ------------------------------ Render ------------------------------ */

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          Loading results…
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm text-center text-rose-700">
          Error: {error?.data?.message || error?.error}
        </div>
      </section>
    );
  }

  if (!searchData?.products?.length) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold">Search Results</h2>
          <span className="text-sm text-gray-600">
            {keyword ? `“${keyword}”` : "All products"}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          No products found.
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Search Results</h2>
        <span className="text-sm text-gray-600">
          {keyword ? `“${keyword}”` : "All products"} ·{" "}
          {searchData.totalProducts} item
          {searchData.totalProducts === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Card */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Filters</h3>

            <div className="space-y-4 text-sm">
              {/* Category */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home</option>
                  {/* Add more categories as needed */}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Brand name"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
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
                  className="w-full px-3 py-2 border rounded-lg mt-2"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-full border hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Card */}
        <main className="flex-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Grid */}
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
        </main>
      </div>
    </section>
  );
};

export default SearchResults;
