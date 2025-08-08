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

    getAllOrdersAdmin: builder.query({
      query: ({ sortBy, order, page, limit, search, status }) => {
        const params = new URLSearchParams({
          sortBy,
          order,
          page,
          limit,
          search,
          status,
        });
        return { url: `${ADMIN_URL}/orders?${params.toString()}` };
      },
      providesTags: ["Orders"],
    }),

    getOrderByIdAdmin: builder.query({
      query: (id) => ({
        url: `${ADMIN_URL}/orders/${id}`,
      }),
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${ADMIN_URL}/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),

    getDashboardSales: builder.query({
      query: () => `${ADMIN_URL}/dashboard/sales`,
    }),
    getTopProducts: builder.query({
      query: () => `${ADMIN_URL}/dashboard/top-products`,
    }),
    getOrderStatusStats: builder.query({
      query: () => `${ADMIN_URL}/dashboard/order-status`,
    }),
    getPaymentMethodStats: builder.query({
      query: () => `${ADMIN_URL}/dashboard/payment-methods`,
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
  useGetAllOrdersAdminQuery,
  useGetOrderByIdAdminQuery,
  useUpdateOrderStatusMutation,
  useGetDashboardSalesQuery,
  useGetTopProductsQuery,
  useGetOrderStatusStatsQuery,
  useGetPaymentMethodStatsQuery,
} = adminApiSlice;
