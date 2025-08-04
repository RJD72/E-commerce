// Importing the essential functions from Redux Toolkit's RTK Query
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
// Importing the base URL from your constants file
import { BASE_URL } from "../constants";

// This is your API slice – the heart of RTK Query setup
export const apiSlice = createApi({
  // This defines the base query logic using fetchBaseQuery,
  // which is a wrapper around the standard fetch API with some conveniences
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL, // The root URL that all your endpoints will be based on

    // This function allows you to dynamically attach headers to every request
    prepareHeaders: (headers, { getState }) => {
      // Access the Redux state and pull out the access token from the auth slice
      const token = getState().auth.accessToken;

      // If a token exists, attach it as a Bearer token to the Authorization header
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      // Always return the modified headers object
      return headers;
    },
  }),

  // Define tag types that will be used for cache invalidation and automated refetching
  // These are like "labels" you assign to data in specific endpoints
  tagTypes: ["Product", "User", "Auth", "Category", "Review", "Wishlist"],

  // Define all endpoints in this section (you’ll extend this later with .injectEndpoints)
  endpoints: () => ({}),
});
