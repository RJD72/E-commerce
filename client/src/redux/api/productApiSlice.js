import { apiSlice } from "./apiSlice";
import { PRODUCT_URL } from "../constants";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => ({
        url: `${PRODUCT_URL}`,
      }),
      transformResponse: (response) => response.data,
    }),

    getProductById: builder.query({
      query: (id) => ({
        url: `${PRODUCT_URL}/${id}`,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetAllProductsQuery, useGetProductByIdQuery } =
  productApiSlice;
