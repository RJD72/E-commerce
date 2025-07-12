/* eslint-disable no-unused-vars */
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetUserByIdQuery,
  useToggleUserStatusMutation,
} from "../../redux/api/adminApiSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import BackButton from "../../components/BackButton";

const AdminUserDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetUserByIdQuery(id);
  const [toggleStatus] = useToggleUserStatusMutation();
  const dispatch = useDispatch(); // if needed for state
  const user = data?.user;
  const [userStatus, setUserStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.status) {
      setUserStatus(user.status);
    }
  }, [user]);

  const handleStatusChange = async () => {
    try {
      const res = await toggleStatus(id).unwrap();

      setUserStatus(res.newStatus); // Update UI
      toast.success(res.message);
    } catch (err) {
      toast.error(err.data.message, {
        position: "top-center",
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.data?.message || error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow space-y-8">
      <BackButton fallback="/admin-users" />
      <div className="flex items-center space-x-6">
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600">Phone: {user.phone || "—"}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Account Info</h3>
        <p>
          Role:{" "}
          <span className="font-medium">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </p>
        <p>Verified: {user.isVerified ? "Yes" : "No"}</p>
        <p>
          Status:{" "}
          <span className="font-medium">
            {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
          </span>
        </p>

        <button
          onClick={handleStatusChange}
          className={`mt-2 px-4 py-2 rounded-full text-white transition ${
            userStatus === "active"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {userStatus === "active" ? "Suspend User" : "Activate User"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
          <AddressDisplay address={user.shippingAddress} />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Billing Address</h3>
          <AddressDisplay address={user.billingAddress} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Wishlist</h3>
        {user.wishList.length > 0 ? (
          <ul className="list-disc ml-5">
            {user.wishList.map((item) => (
              <li key={item.productId}>{item.productId}</li>
            ))}
          </ul>
        ) : (
          <p>No wishlist items.</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Order History</h3>
        {data?.orders?.length > 0 ? (
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="text-left border px-2 py-1">Order ID</th>
                <th className="text-left border px-2 py-1">Date</th>
                <th className="text-left border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/admin-panel/orders/${order._id}`)}
                >
                  <td className="border px-2 py-1">{order._id}</td>
                  <td className="border px-2 py-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-1 capitalize">
                    {order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders placed.</p>
        )}
      </div>
    </div>
  );
};

const AddressDisplay = ({ address }) => {
  if (!address || !address.street) return <p>—</p>;

  return (
    <p className="text-sm">
      {address.street}, {address.city}, {address.province} {address.postalCode},{" "}
      {address.country}
    </p>
  );
};

export default AdminUserDetail;
