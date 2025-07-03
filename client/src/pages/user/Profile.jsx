import { useSelector } from "react-redux";
import { useGetUserQuery } from "../../redux/api/userApiSlice";
import { Outlet, useLocation } from "react-router-dom";
import FocusCard from "../../components/FocusCard";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const { data, error, isLoading } = useGetUserQuery(user._id);

  const isBaseAccountPage = location.pathname === "/profile";

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section>
      <h1 className="text-center text-4xl mt-10">
        Welcome {data?.user?.firstName}
      </h1>
      <div className="mt-16">{isBaseAccountPage && <FocusCard />}</div>
      <Outlet />
    </section>
  );
};
export default Profile;
