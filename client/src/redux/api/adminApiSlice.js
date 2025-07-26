import { apiSlice } from "./apiSlice";
import { ADMIN_URL } from "../constants";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/users`,
      }),
    }),

    getUserById: builder.query({
      query: (id) => ({
        url: `${ADMIN_URL}/users/${id}`,
      }),
    }),

    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `${ADMIN_URL}/users/${id}/deactivate`,
        method: "PATCH",
      }),
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `${ADMIN_URL}/products/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${ADMIN_URL}/products/${id}`,
        method: "DELETE",
      }),
    }),

    createProduct: builder.mutation({
      query: (formData) => ({
        url: `${ADMIN_URL}/products`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useToggleUserStatusMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductMutation,
} = adminApiSlice;
