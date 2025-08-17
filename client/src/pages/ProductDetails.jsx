/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import {
  useGetProductByIdQuery,
  useGetProductReviewsQuery,
} from "../redux/api/productApiSlice";
import { useAddToCartMutation } from "../redux/api/cartApiSlice";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
} from "../redux/api/wishlistApiSlice";
import { useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { triggerCartRefetch } from "../redux/features/cartSlice";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { data, isLoading, error } = useGetProductByIdQuery(id);
  const { data: reviewData, isLoading: isReviewsLoading } =
    useGetProductReviewsQuery({ productId: id });
  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const { data: wishlistData, refetch } = useGetWishlistQuery();
  const wishlist = wishlistData?.wishlist || [];
  const isWishlisted = data && wishlist.some((item) => item._id === data._id);

  const dispatch = useDispatch();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      const res = await addToCart({ productId: data._id, quantity }).unwrap();
      dispatch(triggerCartRefetch());
    } catch (error) {
      toast.error(data.error.message);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    try {
      await addToWishlist({ productId: data._id });
    } catch (error) {
      toast.error(error.message);
    }
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
        <div className="p-2 md:px-6 md:col-span-6 lg:col-span-4 h-[500px]">
          <img
            src={data.images}
            alt={data.name}
            className="rounded-lg h-full object-center"
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
          <div className="">
            <div
              className={`text-xl ${
                data.stock > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {data.stock > 0 ? `In Stock` : "Out of Stock"}
            </div>
            <p>{data.stock} left</p>
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
              disabled={data.stock === 0}
              onChange={(e) => setQuantity(e.target.value)}
              className="border border-gray-400 px-4 py-1 rounded-full text-center"
            />
            <button
              className="w-full bg-midnight-navy hover:bg-midnight-navy/90 text-white py-2 px-4 rounded-full text-sm font-medium cursor-pointer disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              onClick={handleAddToCart}
              disabled={data.stock === 0}
            >
              Add to Cart
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={isWishlisted}
              className="w-full py-2 px-4 rounded-full text-sm font-medium transition bg-midnight-navy text-white hover:bg-midnight-navy/90 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-10 px-4">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
        {isReviewsLoading ? (
          <p>Loading reviews...</p>
        ) : reviewData?.reviews?.length === 0 ? (
          <p className="text-gray-600">
            No reviews yet. Be the first to write one!
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {reviewData.reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-300 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                  <span className="font-medium text-sm">{review.name}</span>
                </div>
                <div className="flex items-center mt-1 text-yellow-400 text-sm">
                  {renderStars(review.rating)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <p className="text-sm mt-2 text-gray-800">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;
