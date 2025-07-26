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
  const { data: featuredCategories, isLoading } = useGetCategoriesQuery({
    limit: 4,
  });
  const { data: featuredProducts, isLoading: productLoading } =
    useGetFeaturedProductsQuery();
  const { isLoading: isSessionLoading } = useSelector((state) => state.session);

  if (isLoading || productLoading || isSessionLoading) {
    return <div>Loading homepage...</div>;
  }

  return (
    <>
      <section className="bg-off-white-linen">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-warm-taupe mx-auto justify-center items-center">
          <div className="pt-16 px-3 flex flex-col justify-center items-center">
            <h2 className="text-4xl font-bold flex flex-col">
              <span>Summer Clothing</span>
              <span className="text-burnt-mustard text-center"> Sale</span>
            </h2>
            <p className="my-6 text-left">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. In, amet!
            </p>
            <div className="mb-4 w-full max-w-sm">
              <MotionButton text={"Shop Now"} />
            </div>
          </div>
          <div className="">
            <img src={Store} />
          </div>
        </div>
      </section>
      <section className="bg-off-white-linen py-8 px-2">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-bold text-2xl mb-6">Featured Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4   gap-8">
            {productLoading ? (
              <div>Loading...</div>
            ) : (
              featuredProducts?.map((item) => (
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
              ))
            )}
          </div>
        </div>
      </section>
      <section className="bg-off-white-linen pt-8 pb-24 px-2">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-bold text-2xl mb-6 text-center md:text-left">
            Shop By Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4   gap-8">
            {isLoading ? (
              <div>Loading...</div>
            ) : !isLoading && featuredCategories?.length > 0 ? (
              featuredCategories.map((category) => (
                <Link to={`/${category._id}/products`} key={category._id}>
                  <CategoryCard
                    category={category.name}
                    imageUrl={category.image}
                  />
                </Link>
              ))
            ) : (
              <div>No categories available</div>
            )}
          </div>
          <div className="flex justify-center md:justify-end mt-6">
            <Link to={"/categories"}>
              <MotionButton text={`All Categories`} icon={<FaArrowRight />} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
