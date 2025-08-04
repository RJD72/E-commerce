import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },

    logoutUser: (state) => {
      state.accessToken = null;
      state.user = null;
      state.justLoggedOut = true;
    },
    clearLogoutFlag: (state) => {
      state.justLoggedOut = false;
    },
  },
});

export const { setCredentials, logoutUser, clearLogoutFlag } =
  authSlice.actions;

export default authSlice.reducer;
