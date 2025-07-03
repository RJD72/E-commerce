import { apiSlice } from "./apiSlice";
import { USER_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => ({
        url: `${USER_URL}/profile`,
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      query: (formData) => ({
        url: `${USER_URL}/profile`,
        method: "PATCH",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation } = userApiSlice;
