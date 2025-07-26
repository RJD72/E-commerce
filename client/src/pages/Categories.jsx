import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import { useGetCategoriesQuery } from "../redux/api/categoriesApiSlice";

const Categories = () => {
  const { data: allCategories, isLoading } = useGetCategoriesQuery();

  if (isLoading) return <div>Loading...</div>;
  return (
    <section className="bg-off-white-linen pt-8 pb-24 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {!isLoading && allCategories?.length > 0 ? (
            allCategories.map((category) => (
              <Link to={`/${category._id}/products`} key={category._id}>
                <CategoryCard
                  category={category.name}
                  key={category._id}
                  imageUrl={category.image}
                />
              </Link>
            ))
          ) : (
            <div className="">No categories available</div>
          )}
        </div>
      </div>
    </section>
  );
};
export default Categories;
