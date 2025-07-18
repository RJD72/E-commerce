import { useSelector } from "react-redux";
import { useGetUserQuery } from "../../redux/api/userApiSlice";
import { Outlet, useLocation } from "react-router-dom";
import FocusCard from "../../components/FocusCard";
import { userCards } from "../../components/cardData/userCards";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const { data, error, isLoading } = useGetUserQuery(user._id);

  const isBaseAccountPage = location.pathname === "/profile";

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section>
      {isBaseAccountPage && (
        <>
          <h1 className="text-center text-4xl my-10">
            Welcome {data?.user?.firstName}
          </h1>
          <FocusCard cards={userCards} />
        </>
      )}
      <Outlet />
    </section>
  );
};
export default Profile;
