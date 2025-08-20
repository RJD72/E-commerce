import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import { useGetCategoriesQuery } from "../redux/api/categoriesApiSlice";

const Categories = () => {
  const { data: allCategories, isLoading } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          Loading categories…
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">All Categories</h2>
        <span className="text-sm text-gray-600">
          Browse by what inspires you
        </span>
      </div>

      {/* Categories grid card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {Array.isArray(allCategories) && allCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allCategories.map((category) => (
              <Link to={`/${category._id}/products`} key={category._id}>
                <CategoryCard
                  category={category.name}
                  imageUrl={category.image}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-10">
            No categories available.
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
