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

    // productApiSlice.js - update the searchProducts endpoint
    searchProducts: builder.query({
      query: ({
        keyword,
        category,
        minPrice,
        maxPrice,
        brand,
        sortBy = "createdAt",
        order = "desc",
        page = 1,
        limit = 10,
      }) => ({
        url: `${PRODUCT_URL}/search`,
        params: {
          keyword,
          category,
          minPrice,
          maxPrice,
          brand,
          sortBy,
          order,
          page,
          limit,
        },
      }),
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useSearchProductsQuery,
} = productApiSlice;
