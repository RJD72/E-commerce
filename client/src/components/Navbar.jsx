/* eslint-disable no-unused-vars */
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutUserMutation } from "../redux/api/authApiSlice";
import { logoutUser } from "../redux/features/authSlice";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "react-toastify";
import {
  cartApiSlice,
  useClearCartMutation,
  useGetUserCartQuery,
} from "../redux/api/cartApiSlice";
import { resetCartRefetch } from "../redux/features/cartSlice";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const user = useSelector((state) => state.auth.user);
  const { data, refetch } = useGetUserCartQuery(undefined, {
    skip: !user,
  });
  const cartItemCount =
    data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const dispatch = useDispatch();
  const [logout] = useLogoutUserMutation();
  const [clearCart] = useClearCartMutation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation();
  const shouldRefetch = useSelector((state) => state.cart.shouldRefetch);
  const { pathname } = useLocation();

  const tabs = [
    { label: "Home", to: "/" },
    { label: "Contact", to: "/contact" },
    { label: "About", to: "/about" },
    { label: "Privacy", to: "/privacy" },
  ];

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      dispatch(resetCartRefetch());
    }
  }, [shouldRefetch, refetch, dispatch]);

  useEffect(() => {
    setDropDownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropDownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // ✅ Step 1: Clear the cart on the server **before** killing the session
      await clearCart().unwrap();

      // ✅ Step 2: Invalidate the backend session
      await logout().unwrap(); // hit backend to invalidate session first

      // ✅ Step 3: Remove local auth tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // ✅ Step 4: Clear Redux auth state and RTK Query cache
      dispatch(logoutUser());

      // Optional: Clear RTK cache
      dispatch(cartApiSlice.util.resetApiState());

      // ✅ Step 5: Redirect + success toast
      toast.success("Successfully logged out", {
        position: "top-center",
        closeOnClick: true,
      });

      navigate("/", { state: { fromLogout: true } });
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  // Navbar.jsx - update the handleSearch function
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedKeyword = searchKeyword.trim();
    if (trimmedKeyword) {
      // You can add additional filters here if needed
      // searchParams.append('category', 'electronics');
      if (mobileMenuOpen) {
        setMobileMenuOpen(false); // Close mobile menu if open
      }
      navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
    }
  };

  const navigateWithDelay = (to) => {
    setMobileMenuOpen(false); // Triggers exit animation
    setTimeout(() => {
      navigate(to);
    }, 300); // match the duration in your motion.nav transition (300ms = 0.3s)
  };

  return (
    <>
      <nav className="relative px-4 py-2 flex justify-between items-center bg-white">
        <Link to={"/"} className="text-2xl font-bold text-violet-600 ">
          MarketPlace
        </Link>

        <div className="lg:hidden">
          <button
            className="navbar-burger flex items-center text-violet-600  p-1"
            id="navbar_burger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="block h-6 w-6 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Hamburger menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
            </svg>
          </button>
        </div>

        <ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:mx-auto lg:flex lg:items-center lg:w-auto lg:space-x-6">
          <li>
            <div className=" relative mx-auto text-gray-600">
              <form
                onSubmit={handleSearch}
                className="relative mx-auto text-gray-600"
              >
                <input
                  className="border border-gray-300 placeholder-current h-10 px-5 pr-16  rounded-full text-sm focus:outline-none  "
                  type="search"
                  name="search"
                  placeholder="Search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />

                <button
                  type="submit"
                  className="absolute right-0 top-0 mt-3 mr-4 cursor-pointer"
                >
                  <svg
                    className="text-gray-600  h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                    x="0px"
                    y="0px"
                    viewBox="0 0 56.966 56.966"
                    xmlSpace="preserve"
                    width="512px"
                    height="512px"
                  >
                    <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                  </svg>
                </button>
              </form>
            </div>
          </li>
        </ul>

        <div className="hidden lg:flex">
          {!user ? (
            <>
              <NavLink to={"/register"}>
                <button className=" py-1.5 px-3 m-1 text-center bg-violet-700 border rounded-full text-white  hover:bg-violet-500 hover:text-gray-100 hidden lg:block">
                  Register
                </button>
              </NavLink>

              <NavLink to={"/login"}>
                <button className=" py-1.5 px-3 m-1 text-center bg-violet-700 border rounded-full text-white  hover:bg-violet-500 hover:text-gray-100 hidden lg:block">
                  Log In
                </button>
              </NavLink>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                onClick={() => setDropDownOpen(!dropDownOpen)}
              >
                <img
                  src={user?.profileImage}
                  alt="Profile picture"
                  className="rounded-full h-full w-full"
                />
              </button>

              <AnimatePresence>
                {dropDownOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50"
                  >
                    <NavLink
                      to={"/profile"}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropDownOpen(!dropDownOpen)}
                    >
                      Profile
                    </NavLink>
                    {user.role === "admin" && (
                      <NavLink
                        to={"/admin-panel"}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropDownOpen(!dropDownOpen)}
                      >
                        Admin Panel
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div>
            <span
              className="hidden"
              id="util_data"
              data="{{ json_encode($util_data) }}"
            ></span>
            <Link
              className=" py-1.5 px-3 m-1 text-center hidden lg:inline-block "
              to={"/cart"}
            >
              <div className="relative">
                <AiOutlineShoppingCart size={24} />
                {user && cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>
      <nav className="hidden lg:flex justify-center gap-4 relative mb-16">
        {tabs.map(({ label, to }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="relative px-2 py-1  font-medium text-gray-700"
            >
              {label}
              {isActive && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 -bottom-1 h-[2px] bg-violet-600 rounded"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* mobile navbar */}

      <div className="navbar-menu relative z-50">
        <div
          className={`navbar-backdrop fixed inset-0 bg-gray-800 transition-opacity duration-500 ${
            mobileMenuOpen ? "opacity-50 visible" : "opacity-0 invisible"
          }`}
        ></div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              key="mobile-nav"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5 }}
              className="fixed bg-white  top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 border-r overflow-y-auto"
            >
              <div className="flex items-center mb-8">
                <Link
                  to={"/"}
                  className="mr-auto text-2xl font-bold text-black"
                >
                  MarketPlace
                </Link>

                <button
                  className="navbar-close"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg
                    className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <form
                onSubmit={handleSearch}
                className="relative mx-auto text-gray-600"
              >
                <input
                  className="border border-gray-300 placeholder-current h-10 px-5 pr-16  rounded-full text-sm focus:outline-none  "
                  type="search"
                  name="search"
                  placeholder="Search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />

                <button
                  type="submit"
                  className="absolute right-0 top-0 mt-3 mr-4 cursor-pointer"
                >
                  <svg
                    className="text-gray-600  h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                    x="0px"
                    y="0px"
                    viewBox="0 0 56.966 56.966"
                    xmlSpace="preserve"
                    width="512px"
                    height="512px"
                  >
                    <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                  </svg>
                </button>
              </form>

              <div className="mt-6">
                <button
                  className="text-left w-full py-2"
                  onClick={() => navigateWithDelay("/")}
                >
                  Home
                </button>

                <button
                  className="text-left w-full py-2"
                  onClick={() => navigateWithDelay("/contact")}
                >
                  Contact
                </button>

                <button
                  className="text-left w-full py-2"
                  onClick={() => navigateWithDelay("/about")}
                >
                  About
                </button>

                <button
                  className="text-left w-full py-2"
                  onClick={() => navigateWithDelay("/privacy")}
                >
                  Privacy
                </button>

                {user && (
                  <button
                    className="text-left w-full py-2"
                    onClick={() => navigateWithDelay("/profile")}
                  >
                    Profile
                  </button>
                )}
                {user && user.role === "admin" && (
                  <button
                    className="text-left w-full py-2"
                    onClick={() => navigateWithDelay("/admin-panel")}
                  >
                    Admin Panel
                  </button>
                )}
              </div>

              <div className="mt-auto">
                {!user ? (
                  <div className="">
                    <NavLink to={"/login"}>
                      <button className=" py-1.5 px-3 m-1 text-center bg-violet-700 border rounded-full text-white  hover:bg-violet-500 hover:text-gray-100 w-full">
                        Log In
                      </button>
                    </NavLink>
                    <NavLink to={"/register"}>
                      <button className=" py-1.5 px-3 m-1 text-center bg-violet-700 border rounded-full text-white  hover:bg-violet-500 hover:text-gray-100 w-full">
                        Register
                      </button>
                    </NavLink>
                  </div>
                ) : (
                  <div className="pt-6">
                    <button
                      onClick={handleLogout}
                      className="py-1.5 px-3 m-1 text-center bg-violet-700 border rounded-full text-white  hover:bg-violet-500 hover:text-gray-100 w-full"
                    >
                      Sign out
                    </button>
                  </div>
                )}
                <p className="my-4 text-xs text-center text-gray-400">
                  <span>MarketPlace Copyright © 2025</span>
                </p>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
export default Navbar;
