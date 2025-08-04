/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  FaRegHeart,
  FaHeart,
  FaStarOfLife,
  FaRegStar,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAddToCartMutation } from "../redux/api/cartApiSlice";
import { triggerCartRefetch } from "../redux/features/cartSlice";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../redux/api/wishlistApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "motion/react";

const ProductCard = ({ image, name, price, brand, rating, numReviews, id }) => {
  const [quantity, setQuantity] = useState(1);
  const [showSparkle, setShowSparkle] = useState(false);
  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const { data: wishlistData, refetch } = useGetWishlistQuery();
  const wishlist = wishlistData?.wishlist || [];
  const isWishlisted = wishlist.some((item) => item._id === id);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await addToCart({ productId: id, quantity }).unwrap();
      dispatch(triggerCartRefetch());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    try {
      if (isWishlisted) {
        await removeFromWishlist({ productId: id });
      } else {
        await addToWishlist({ productId: id });
        await refetch();
        setShowSparkle(true);
        setTimeout(() => setShowSparkle(false), 600);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product-details/${id}`} className="block">
        <div className="relative">
          <img src={image} alt={name} className="w-full h-80 object-cover" />
          <div className="absolute top-2 right-2 z-10">
            <button
              className="relative p-2 rounded-full bg-white text-gray-700 hover:bg-pink-100 hover:text-pink-600 transition-colors duration-300"
              onClick={toggleWishlist}
            >
              {isWishlisted ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}

              <AnimatePresence>
                {showSparkle && (
                  <motion.span
                    className="absolute -top-1 -right-1 text-yellow-400 text-xl pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1.5, rotate: 360 }}
                    exit={{ opacity: 0, scale: 0.3, rotate: 720 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FaStarOfLife />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <span className="text-xs font-semibold text-white">
              New Arrival
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                {name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{brand}</p>
            </div>
            <p className="text-sm font-medium text-pink-600">${price}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {numReviews} {numReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <button
          className="w-full bg-midnight-navy hover:bg-off-white-linen text-white py-2 px-4 rounded-full text-sm font-medium"
          onClick={handleSubmit}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
