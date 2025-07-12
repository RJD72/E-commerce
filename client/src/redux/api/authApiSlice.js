// Import the apiSlice you previously created with createApi (from apiSlice.js)
import { apiSlice } from "./apiSlice";

// Import the base AUTH_URL from constants (e.g., "/api/auth" or similar)
import { AUTH_URL } from "../constants";

// Extend the base apiSlice by injecting additional endpoints into it.
// This allows separation of concerns — you can organize different endpoints by domain (auth, products, etc.).
export const authApiSlice = apiSlice.injectEndpoints({
  // This function receives a builder object, which provides methods for defining endpoints.
  endpoints: (builder) => ({
    // Define a mutation for logging in a user.
    // Mutations are used for POST, PUT, DELETE — anything that changes data on the server.
    loginUser: builder.mutation({
      // The `query` function specifies how to make the request.
      // It receives `data`, which is the payload passed in when calling the hook (e.g., { email, password }).
      query: (data) => ({
        url: `${AUTH_URL}/login`, // Construct the full API endpoint
        method: "POST", // HTTP method
        body: data, // The data sent in the request body (e.g., login credentials)
      }),
      invalidatesTags: ["Auth"],
    }),

    registerUser: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/register`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, password, confirmPassword }) => ({
        url: `${AUTH_URL}/reset-password/${token}`,
        method: "POST",
        body: { password, confirmPassword },
      }),
      invalidatesTags: ["Auth"],
    }),

    resendVerification: builder.mutation({
      query: ({ email }) => ({
        url: `${AUTH_URL}/resend-verification`,
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useRegisterUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
} = authApiSlice;
