import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Route,
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";

import "./index.css";
import App from "./App.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Profile from "./pages/user/Profile.jsx";
import Addresses from "./pages/user/Addresses.jsx";
import Orders from "./pages/user/Orders.jsx";
import UserContact from "./pages/user/UserContact.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />}>
          <Route path="addresses" element={<Addresses />} />
          <Route path="orders" element={<Orders />} />
          <Route path="user-contact" element={<UserContact />} />
        </Route>
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
