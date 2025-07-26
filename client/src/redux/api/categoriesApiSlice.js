import { apiSlice } from "./apiSlice";
import { CATEGORY_URL } from "../constants";

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (params) => {
        const queryString = params?.limit ? `?limit=${params.limit}` : "";
        return {
          url: `${CATEGORY_URL}${queryString}`,
        };
      },
      providesTags: ["Categories"], // 👈 you probably meant this, not `invalidatesTags`
    }),

    getProductsByCategory: builder.query({
      query: ({
        categoryId,
        page = 1,
        limit = 12,
        sortBy = "createdAt",
        order = "asc",
      }) => ({
        url: `${CATEGORY_URL}/${categoryId}/products`,
        params: { page, limit, sortBy, order },
      }),
      providesTags: (results, error, { categoryId }) => [
        { type: "CategoryProducts", id: categoryId },
      ],
    }),

    createCategory: builder.mutation({
      query: ({ name }) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: ({ id }) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ name, id }) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "PATCH",
        body: { name },
      }),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsByCategoryQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} = categoriesApiSlice;
