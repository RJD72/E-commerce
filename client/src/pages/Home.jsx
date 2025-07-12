import { Link } from "react-router-dom";
import Store from "../assets/store.jpg";
import MotionButton from "../components/MotionButton";
import FeaturedCard from "../components/FeaturedCard.jsx";
import CategoryCard from "../components/CategoryCard.jsx";
import { FaArrowRight } from "react-icons/fa6";

const Home = () => {
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
            <FeaturedCard />
            <FeaturedCard />
            <FeaturedCard />
            <FeaturedCard />
          </div>
        </div>
      </section>
      <section className="bg-off-white-linen pt-8 pb-24 px-2">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-bold text-2xl mb-6 text-center md:text-left">
            Shop By Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4   gap-8">
            <CategoryCard />
            <CategoryCard />
            <CategoryCard />
            <CategoryCard />
          </div>
          <div className="flex justify-center md:justify-end mt-6">
            <Link to={"/categories"}>
              <MotionButton text={`All Products`} icon={<FaArrowRight />} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
