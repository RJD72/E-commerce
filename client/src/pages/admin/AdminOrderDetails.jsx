import { useParams } from "react-router-dom";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "../../redux/api/adminApiSlice";
import { format } from "date-fns";
import { useState } from "react";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const { data: order, isLoading, error, refetch } = useGetOrderByIdQuery(id);
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
          {/* ... (same as before) */}

          {/* Shipping Address */}
          {/* ... (same as before) */}

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

            {/* Status Update Dropdown */}
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
              <strong>Delivered:</strong>{" "}
              {order.deliveredAt
                ? format(new Date(order.deliveredAt), "PPP p")
                : "No"}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
          </section>

          {/* Ordered Items + Summary */}
          {/* ... (same as before) */}
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;

// Helper
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
