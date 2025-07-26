import { useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "../redux/api/productApiSlice";

import { useState } from "react";
import { FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { data, isLoading, error } = useGetProductByIdQuery(id);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating); // Round down to nearest whole number
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    return stars;
  };

  const formatPrice = (price) => {
    const [dollars, cents] = Number(price).toFixed(2).split(".");
    return (
      <>
        {dollars}.<span className="text-base relative -top-[5px]">{cents}</span>
      </>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <section className="">
      <div className="flex flex-col md:grid md:grid-cols-12 p-2 lg:px-8 mx-auto lg:gap-6">
        {/* Left Column */}
        <div className="p-2 md:px-6 md:col-span-6 lg:col-span-4 ">
          <img
            src={data.images}
            alt={data.name}
            className="rounded-lg w-full"
          />
        </div>

        {/* Middle Column */}
        <div className="gap-4 flex flex-col col-span-6 px-2">
          <div className="font-semibold text-2xl">{data.name}</div>
          <div className="">
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(data.rating)}</div>
              <span className="text-sm text-gray-600">
                {data.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.numReviews} {data.numReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
          <hr className="text-gray-300" />
          <div className="">{data.description}</div>
        </div>

        {/* Right Column */}
        <div className="border border-gray-300 rounded-lg lg:col-span-2 p-2 lg:p-6 flex flex-col justify-between md:col-start-7 md:col-end-13 mt-6 lg:mt-0">
          <div className="font-semibold text-2xl">
            <span className="text-sm relative font-normal mr-0.5 -top-[6px]">
              $
            </span>
            {formatPrice(data.price)}
          </div>
          <div
            className={`text-xl ${
              data.stock ? "text-green-500" : "text-red-50"
            }`}
          >
            {data.stock ? "In Stock" : "Out of Stock"}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <label htmlFor="quantity" className="-mb-1.5">
              Quantity:
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min={1}
              max={data.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border border-gray-400 px-4 py-1 rounded-full text-center"
            />
            <button className="w-full bg-midnight-navy hover:bg-midnight-navy/90 text-white py-2 px-4 rounded-full text-sm font-medium cursor-pointer">
              Add to Cart
            </button>
            <button className="w-full bg-midnight-navy hover:bg-midnight-navy/90 text-white py-2 px-4 rounded-full text-sm font-medium cursor-pointer">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10">
        <h2 className="text-2xl font-semibold text-center">Reviews</h2>
      </div>
    </section>
  );
};
export default ProductDetails;
