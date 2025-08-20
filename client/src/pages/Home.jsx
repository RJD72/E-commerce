import { Link } from "react-router-dom";
import Store from "../assets/store.jpg";
import MotionButton from "../components/MotionButton";
import { useSelector } from "react-redux";
import { FaArrowRight } from "react-icons/fa6";
import { useGetCategoriesQuery } from "../redux/api/categoriesApiSlice.js";
import { useGetFeaturedProductsQuery } from "../redux/api/productApiSlice.js";
import ProductCard from "../components/ProductCard.jsx";
import CategoryCard from "../components/CategoryCard.jsx";

const Home = () => {
  // same queries, same args
  const { data: featuredCategories, isLoading } = useGetCategoriesQuery({
    limit: 4,
  });
  const { data: featuredProducts, isLoading: productLoading } =
    useGetFeaturedProductsQuery();
  const { isLoading: isSessionLoading } = useSelector((state) => state.session);

  const anyLoading = isLoading || productLoading || isSessionLoading;

  if (anyLoading) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          Loading homepage…
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Copy */}
            <div className="p-8 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Summer Clothing <span className="text-burnt-mustard">Sale</span>
              </h1>
              <p className="mt-4 text-gray-700">
                Fresh styles, easy prices, and a checkout experience smoother
                than butter on a hot skillet.
              </p>

              <div className="mt-6 w-full max-w-sm">
                <MotionButton text="Shop Now" />
              </div>
            </div>

            {/* Visual */}
            <div className="h-full">
              <img
                src={Store}
                alt="Storefront"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Featured Products ===== */}
      <section className="max-w-7xl mx-auto p-6 pt-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-sm text-gray-600">
                Hand-picked favorites you can’t miss.
              </p>
            </div>
            <Link to="/categories" className="hidden sm:block">
              <MotionButton text="All Categories" icon={<FaArrowRight />} />
            </Link>
          </div>

          {Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((item) => (
                <ProductCard
                  id={item._id}
                  key={item._id}
                  image={item.images}
                  name={item.name}
                  price={item.price}
                  brand={item.brand}
                  rating={item.rating}
                  numReviews={item.numReviews}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6">
              No featured products right now.
            </div>
          )}

          {/* Mobile CTA */}
          <div className="sm:hidden flex justify-center mt-6">
            <Link to="/categories">
              <MotionButton text="All Categories" icon={<FaArrowRight />} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Shop by Categories ===== */}
      <section className="max-w-7xl mx-auto p-6 pt-2 pb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold">Shop By Categories</h2>
              <p className="text-sm text-gray-600">
                Browse by what inspires you.
              </p>
            </div>
            <Link to="/categories" className="hidden sm:block">
              <MotionButton text="Explore All" icon={<FaArrowRight />} />
            </Link>
          </div>

          {Array.isArray(featuredCategories) &&
          featuredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredCategories.map((category) => (
                <Link to={`/${category._id}/products`} key={category._id}>
                  <CategoryCard
                    category={category.name}
                    imageUrl={category.image}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6">
              No categories available.
            </div>
          )}

          {/* Mobile CTA */}
          <div className="sm:hidden flex justify-center mt-6">
            <Link to="/categories">
              <MotionButton text="Explore All" icon={<FaArrowRight />} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
