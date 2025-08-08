import { useParams } from "react-router-dom";
import {
  useGetOrderByIdAdminQuery,
  useUpdateOrderStatusMutation,
} from "../../redux/api/adminApiSlice";
import { format } from "date-fns";
import { useState } from "react";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderByIdAdminQuery(id);
  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [newStatus, setNewStatus] = useState("");

  const handleStatusChange = async () => {
    if (!newStatus) return;
    try {
      await updateOrderStatus({ id, status: newStatus }).unwrap();
      await refetch();
      setNewStatus("");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      {isLoading && <p>Loading order...</p>}
      {error && <p className="text-red-500">Error loading order details</p>}

      {order && (
        <div className="space-y-8">
          {/* Customer Info */}
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Customer Info</h2>
            <p>
              <strong>Name:</strong> {order.user.firstName}{" "}
              {order.user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {order.user.email}
            </p>
          </section>

          {/* Shipping Address */}
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.province}
            </p>
            <p>
              {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </p>
          </section>

          {/* Order Info */}
          <section className="bg-white rounded shadow p-4 space-y-2">
            <h2 className="text-lg font-semibold mb-2">Order Info</h2>
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Placed:</strong>{" "}
              {format(new Date(order.createdAt), "PPP p")}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${getBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </p>
            <div className="flex items-center gap-4 mt-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Change Status...</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusChange}
                disabled={isUpdating || !newStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
            <p>
              <strong>Paid:</strong>{" "}
              {order.isPaid ? format(new Date(order.paidAt), "PPP p") : "No"}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
          </section>

          {/* Ordered Items */}
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Ordered Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Product Name</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Quantity</th>
                    <th className="p-2 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2 border">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="p-2 border">{item.product.name}</td>
                      <td className="p-2 border">
                        ${parseFloat(item.product.price).toFixed(2)}
                      </td>
                      <td className="p-2 border">{item.quantity}</td>
                      <td className="p-2 border">
                        $
                        {(
                          parseFloat(item.product.price) * item.quantity
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <p>
              <strong>Total Amount:</strong> $
              {parseFloat(order.totalAmount).toFixed(2)}
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;

function getBadge(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
