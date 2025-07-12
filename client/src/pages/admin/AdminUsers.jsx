import { Link, useNavigate } from "react-router-dom";
import { useGetAllUsersQuery } from "../../redux/api/adminApiSlice";
import BackButton from "../../components/BackButton";

const AdminUsers = () => {
  const { data: users, isLoading, error } = useGetAllUsersQuery();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin-panel" />
      <h2 className="text-2xl font-bold my-4">All Users</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2">Last Name</th>
            <th className="px-4 py-2">First Name</th>
            <th className="px-4 py-2">User Id</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {users?.data?.map((user) => (
            <tr
              key={user._id}
              className="hover:bg-gray-100 cursor-pointer transition duration-200"
              onClick={() =>
                navigate(`/admin-panel/admin-users/details/${user._id}`)
              }
            >
              <td className="border px-4 py-2">{user.lastName}</td>
              <td className="border px-4 py-2">{user.firstName}</td>
              <td className="border px-4 py-2">{user._id}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AdminUsers;
