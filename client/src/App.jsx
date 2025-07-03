import { Outlet } from "react-router-dom";

import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "./redux/features/authSlice";

const App = () => {
  const dispatch = useDispatch();

  // Local state to track whether we're still checking for a valid session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function checks if a valid refresh token exists in a secure cookie
    // and if so, requests a new access token + user info from the backend
    const refreshToken = async () => {
      try {
        // Send GET request to refresh endpoint
        // 'credentials: include' ensures cookies are sent (required for refresh tokens)
        const res = await fetch(
          "http://localhost:5000/api/auth/refresh-token",
          {
            method: "GET",
            credentials: "include",
          }
        );

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
        } else {
          // No valid session - user is not logged in
          console.log("No session found, User is unauthenticated");
        }
      } catch (error) {
        // Something went wrong (network error, invalid/expired refresh token, etc.)
        console.log("Session refresh failed:", error);
        // You can optionally redirect the user to login here
      } finally {
        // Hide the loading screen and render the app, regardless of outcome
        setLoading(false);
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
  if (loading) return <div>Loading session...</div>;
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};
export default App;
