import { useSelector } from "react-redux";
import { useGetUserQuery } from "../../redux/api/userApiSlice";
import { Outlet, useLocation } from "react-router-dom";
import FocusCard from "../../components/FocusCard";
import { adminCards } from "../../components/cardData/adminCards";

const AdminPanel = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const { data, error, isLoading } = useGetUserQuery(user._id);

  const isBaseAccountPage = location.pathname === "/admin-panel";

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section>
      {isBaseAccountPage && (
        <>
          <h1 className="text-center text-5xl">Admin Panel</h1>
          <h2 className="text-center text-4xl my-10">
            Welcome {data?.user?.firstName}
          </h2>
          <FocusCard cards={adminCards} />
        </>
      )}
      <Outlet />
    </section>
  );
};
export default AdminPanel;
