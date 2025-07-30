import { apiSlice } from "./apiSlice";
import { PAYMENTS_URL } from "../constants";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (cartItems) => ({
        url: `${PAYMENTS_URL}/create-checkout-session`,
        body: cartItems,
      }),
    }),
  }),
});

export const { useCreateCheckoutSessionMutation } = paymentApiSlice;
