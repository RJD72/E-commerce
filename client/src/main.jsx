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
import ResendVerificationPage from "./pages/auth/ResendVerificationPage.jsx";
import EmailVerified from "./pages/EmailVerified.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPasswordForm from "./pages/ForgotPasswordForm.jsx";
import AdminRoute from "./pages/admin/AdminRoute.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminUserDetail from "./pages/admin/AdminUserDetail.jsx";
import AdminProductDetails from "./pages/admin/AdminProductDetails.jsx";
import AdminAddProduct from "./pages/admin/AdminAddProduct.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import CategoryProducts from "./pages/CategoryProducts.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import AdminCategory from "./pages/admin/AdminCategory.jsx";
import Cart from "./pages/Cart.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public Routes */}
      <Route index element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/:categoryId/products" element={<CategoryProducts />} />
      <Route path="/product-details/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      <Route path="/email-verified" element={<EmailVerified />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />}>
          <Route path="addresses" element={<Addresses />} />
          <Route path="orders" element={<Orders />} />
          <Route path="user-contact" element={<UserContact />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin-panel" element={<AdminPanel />}>
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="admin-categories" element={<AdminCategory />} />

          <Route path="admin-users/details/:id" element={<AdminUserDetail />} />
          <Route path="admin-products" element={<AdminProducts />} />
          <Route
            path="admin-products/add-product"
            element={<AdminAddProduct />}
          />
          <Route
            path="admin-products/details/:id"
            element={<AdminProductDetails />}
          />
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

// main.jsx (after React DOM renders)
const preloader = document.getElementById("preloader");

if (preloader) {
  preloader.style.opacity = "0";
  preloader.style.transition = "opacity 0.5s ease";
  setTimeout(() => preloader.remove(), 500);
}
