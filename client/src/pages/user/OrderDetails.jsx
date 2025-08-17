import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetOrderByIdQuery } from "../../redux/api/orderApiSlice";
import BackButton from "../../components/BackButton";

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(id, { refetchOnMountOrArgChange: true });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !order)
    return <div className="p-4 text-red-600">Failed to load order.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton fallback="/orders" />
      <h2 className="text-2xl font-bold my-6">Order #{order._id}</h2>

      <div className="mb-6">
        <p>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
        <p>{order.shippingAddress.street}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.province},{" "}
          {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.country}</p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Items</h3>
      <table className="table-auto w-full border border-gray-300 mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Review</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => {
            const userReview = item.product?.reviews?.find((review) => {
              if (!review?.user || !user?._id) return false;
              return review.user.toString?.() === user._id.toString();
            });

            return (
              <tr key={item.product._id}>
                <td className="border px-4 py-2">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-12 w-12 object-cover"
                  />
                </td>
                <td className="border px-4 py-2">{item.product.name}</td>
                <td className="border px-4 py-2">{item.quantity}</td>
                <td className="border px-4 py-2">${item.product.price}</td>
                <td className="border px-4 py-2">
                  <Link
                    to={`/add-review/${item.product._id}?orderId=${order._id}`}
                    className={`underline text-sm ${
                      userReview ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {userReview ? "Edit Review" : "Leave Review"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetails;
