import { apiSlice } from "./apiSlice";
import { PRODUCT_URL } from "../constants";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: ({
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
        isFeatured,
      }) => {
        const params = { page, limit, sortBy, order };
        if (isFeatured !== undefined) params.isFeatured = isFeatured;
        return {
          url: `${PRODUCT_URL}`,
          params,
        };
      },
    }),

    getFeaturedProducts: builder.query({
      query: () => ({
        url: `${PRODUCT_URL}/featured`,
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

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
} = productApiSlice;
