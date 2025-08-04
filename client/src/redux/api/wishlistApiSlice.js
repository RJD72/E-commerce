import { apiSlice } from "./apiSlice";
import { WISHLIST_URL } from "../constants";

export const wishlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addToWishlist: builder.mutation({
      query: ({ productId }) => ({
        url: `${WISHLIST_URL}/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    getWishlist: builder.query({
      query: () => ({
        url: `${WISHLIST_URL}`,
      }),
      providesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: ` ${WISHLIST_URL}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} = wishlistApiSlice;
