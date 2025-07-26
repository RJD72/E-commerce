import { apiSlice } from "./apiSlice";
import { CART_URL } from "../constants";

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addToCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `${CART_URL}`,
        method: "POST",
        body: { productId, quantity },
      }),
    }),

    getUserCart: builder.query({
      query: () => ({
        url: `${CART_URL}`,
      }),
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: `${CART_URL}`,
        method: "DELETE",
      }),
    }),

    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `${CART_URL}/`,
        method: "PATCH",
        body: { productId, quantity },
      }),
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetUserCartQuery,
  useClearCartMutation,
  useUpdateCartItemMutation,
} = cartApiSlice;
