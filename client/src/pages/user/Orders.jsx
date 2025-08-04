import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import Pagination from "../../components/Pagination";
import BackButton from "../../components/BackButton";

const Orders = () => {
  const { data: orders, isLoading, isError } = useGetMyOrdersQuery();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedOrders = useMemo(() => {
    if (!orders) return [];

    return [...orders].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "id":
          aValue = a._id;
          bValue = b._id;
          break;
        case "date":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "total":
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case "item":
          aValue = a.items[0]?.product?.name || "";
          bValue = b.items[0]?.product?.name || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderArrow = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  if (isLoading) return <div className="p-4">Loading orders...</div>;
  if (isError)
    return <div className="p-4 text-red-600">Failed to load orders.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton fallback="/" />
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {paginatedOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <>
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th
                  className="px-4 py-2 border-r border-gray-300 cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  Order ID{renderArrow("id")}
                </th>
                <th
                  className="px-4 py-2 border-r border-gray-300 cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  Date{renderArrow("date")}
                </th>
                <th
                  className="px-4 py-2 border-r border-gray-300 cursor-pointer whitespace-nowrap min-w-[100px]"
                  onClick={() => handleSort("total")}
                >
                  Total{renderArrow("total")}
                </th>
                <th className="px-4 py-2 border-r border-gray-300">Status</th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("item")}
                >
                  First Item{renderArrow("item")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() =>
                    navigate(`/profile/orders/order-details/${order._id}`)
                  }
                  className="hover:bg-gray-50 cursor-pointer border-t border-gray-200"
                >
                  <td className="px-4 py-2 border-r border-gray-300">
                    {order._id}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300 capitalize">
                    {order.status}
                  </td>
                  <td className="px-4 py-2">
                    {order.items[0]?.product?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              keyword={null}
              filters={{}}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
