import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { matchPath } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "./redux/features/authSlice";
import { setSessionLoading } from "./redux/features/sessionSlice";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import { BASE_URL } from "./redux/constants";

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const hideLayoutRoutes = [
    "/resend-verification",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:token",
  ];

  const shouldHideLayout = hideLayoutRoutes.some((path) =>
    matchPath({ path, end: true }, location.pathname)
  );

  // Local state to track whether we're still checking for a valid session
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // This function checks if a valid refresh token exists in a secure cookie
    // and if so, requests a new access token + user info from the backend
    const refreshToken = async () => {
      dispatch(setSessionLoading(true));
      try {
        const token = localStorage.getItem("refreshToken");

        if (!token) {
          setLoading(false);
          dispatch(setSessionLoading(false));
          return;
        }
        // Send GET request to refresh endpoint
        // 'credentials: include' ensures cookies are sent (required for refresh tokens)
        const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: token }),
        });

        // Parse the JSON response
        const data = await res.json();

        // If server responded with 200 OK and gave us new credentials
        if (res.ok) {
          // Store the accessToken and user in Redux
          // This rehydrates the session after a page refresh
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: data.user,
            })
          );
        }
      } catch (error) {
        // Something went wrong (network error, invalid/expired refresh token, etc.)
        console.log("Session refresh failed:", error);

        // Only navigate to login if the current route is protected
        const protectedRoutes = ["/profile", "/dashboard", "/admin", "/orders"];

        const isProtected = protectedRoutes.some((path) =>
          location.pathname.startsWith(path)
        );

        if (isProtected) {
          // You can optionally redirect the user to login here
          navigate("/login");
        }
      } finally {
        // Hide the loading screen and render the app, regardless of outcome
        setLoading(false);
        dispatch(setSessionLoading(false));
      }
    };

    // Call the refresh logic as soon as the app loads
    refreshToken();

    // Start interval to refresh every 14 minutes (before token expires)
    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // 14 minutes interval

    // Clear the interval if the component unmounts
    return () => clearInterval(interval);
  }, [dispatch]);

  // While waiting for session check to complete, show a loading screen
  if (loading)
    return (
      <div className="flex justify-center items-center">
        <div>Loading session...</div>
      </div>
    );

  return (
    <>
      <ToastContainer />
      {!shouldHideLayout && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!shouldHideLayout && <Footer />}
    </>
  );
};
export default App;
