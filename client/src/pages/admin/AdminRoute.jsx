import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearLogoutFlag } from "../../redux/features/authSlice";

import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const justLoggedOut = useSelector((state) => state.auth.justLoggedOut);
  const dispatch = useDispatch();

  useEffect(() => {
    if (justLoggedOut) {
      dispatch(clearLogoutFlag());
    }
  }, [justLoggedOut, dispatch]);

  if (!user || user.role !== "admin") {
    return <Navigate to={justLoggedOut ? "/" : "/login"} replace />;
  }

  return <Outlet />;
};
export default AdminRoute;
