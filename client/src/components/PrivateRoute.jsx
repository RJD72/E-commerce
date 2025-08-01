import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { clearLogoutFlag } from "../redux/features/authSlice";
import { useEffect } from "react";

const PrivateRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const justLoggedOut = useSelector((state) => state.auth.justLoggedOut);
  const dispatch = useDispatch();

  useEffect(() => {
    if (justLoggedOut) {
      dispatch(clearLogoutFlag());
    }
  }, [justLoggedOut, dispatch]);

  if (!user) {
    return <Navigate to={justLoggedOut ? "/" : "/login"} replace />;
  }

  return <Outlet />;
};
export default PrivateRoute;
