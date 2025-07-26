/* eslint-disable no-unused-vars */
import { useState } from "react";
import { FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAddToCartMutation } from "../redux/api/cartApiSlice";
import { triggerCartRefetch } from "../redux/features/cartSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

const ProductCard = ({ image, name, price, brand, rating, numReviews, id }) => {
  const [quantity, setQuantity] = useState(1);
  const [addToCart] = useAddToCartMutation();

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

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product-details/${id}`} className="block">
        <div className="relative">
          <img src={image} alt={name} className="w-full h-80 object-cover" />
          <div className="absolute top-2 right-2">
            <button
              className="p-2 rounded-full bg-white text-gray-700 hover:bg-pink-100 hover:text-pink-600 transition-colors duration-300"
              onClick={(e) => e.preventDefault()} // Prevent Link nav
            >
              <FaRegHeart />
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
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
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
