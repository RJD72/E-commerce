import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    isLoading: true,
  },
  reducers: {
    setSessionLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSessionLoading } = sessionSlice.actions;
export default sessionSlice.reducer;
