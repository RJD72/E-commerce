export const BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://e-commerce-zk07.onrender.com/api"
    : "http://localhost:5000/api";

export const AUTH_URL = `${BASE_URL}/auth`;
export const USER_URL = `${BASE_URL}/user`;
export const PRODUCT_URL = `${BASE_URL}/products`;
export const CART_URL = `${BASE_URL}/cart`;
export const ORDERS_URL = `${BASE_URL}/orders`;
export const PAYMENTS_URL = `${BASE_URL}/payments`;
export const ADMIN_URL = `${BASE_URL}/admin`;
export const WISHLIST_URL = `${BASE_URL}/wishlist`;
export const CATEGORY_URL = `${BASE_URL}/category`;
