import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    shouldRefetch: false,
  },
  reducers: {
    triggerCartRefetch: (state) => {
      state.shouldRefetch = true;
    },
    resetCartRefetch: (state) => {
      state.shouldRefetch = false;
    },
  },
});

export const { triggerCartRefetch, resetCartRefetch } = cartSlice.actions;
export default cartSlice.reducer;
