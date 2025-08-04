// pages/AddReview.jsx
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  useAddReviewMutation,
  useDeleteReviewMutation,
  useGetMyReviewQuery,
  useUpdateReviewMutation,
} from "../../redux/api/productApiSlice";
import { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

const AddReview = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const navigate = useNavigate();
  const [addReview] = useAddReviewMutation();
  const { data: existingReview } = useGetMyReviewQuery(productId);
  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, []);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );
    if (!confirmed || !existingReview) return;

    try {
      await deleteReview({
        productId,
        reviewId: existingReview._id,
      }).unwrap();

      alert("Review deleted!");
      navigate(`/profile/orders/order-details/${orderId}`);
    } catch (err) {
      alert(err?.data?.message || "Failed to delete review.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingReview) {
        await updateReview({ productId, rating, comment }).unwrap();
        alert("Review updated!");
      } else {
        await addReview({ productId, rating, comment }).unwrap();
        alert("Review added!");
      }

      navigate(`/profile/orders/order-details/${orderId}`);
    } catch (err) {
      alert(err?.data?.message || "Failed to submit review.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Rating:</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const Icon = (hover || rating) >= star ? FaStar : FaRegStar;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  className="text-yellow-500 text-2xl"
                >
                  <Icon />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Comment:</label>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            required
          />
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
          <button
            type="button"
            className="text-gray-600 hover:underline"
            onClick={() => navigate(`/profile/orders/order-details/${orderId}`)}
          >
            Cancel
          </button>
        </div>

        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 underline text-sm mt-2"
          >
            Delete Review
          </button>
        )}
      </form>
    </div>
  );
};

export default AddReview;
