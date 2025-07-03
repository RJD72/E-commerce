import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Clothes from "./../../assets/clothes.jpg";
import { useDispatch } from "react-redux";
import { useLoginUserMutation } from "../../redux/api/authApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Call the login endpoint with credentials
      const res = await loginUser({ email, password }).unwrap();

      //2. Dispatch to authSlice to store token and user in Redux
      dispatch(
        setCredentials({ accessToken: res.accessToken, user: res.user })
      );
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      console.log("Login failed:", error.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>{error.message}</p>;

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-110px)]">
      <div className="flex flex-col md:flex-row justify-center items-center shadow-lg lg:gap-6 p-6 m-4 mx-auto rounded-lg">
        <div className="hidden md:inline">
          <img src={Clothes} alt="" className="rounded-lg h-[500px]" />
        </div>
        <div className="w-[350px] h-[500px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[20px_30px] box-border">
          <p className="text-center text-[28px] font-extrabold mb-[30px] mt-[10px] font-sans">
            Welcome back
          </p>
          <form
            className="w-full flex flex-col gap-[18px] mb-[15px]"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              placeholder="Email"
              className="rounded-full border border-gray-300 outline-none p-[12px_15px] box-border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="rounded-full border border-gray-300 outline-none p-[12px_15px] box-border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-end underline text-[#747474] underline-offset-2 m-0">
              <span className="cursor-pointer text-[9px] font-bold hover:text-black font-sans">
                Forgot Password?
              </span>
            </p>
            <button
              type="submit"
              className="p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 hover:bg-red-500 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
            >
              Log in
            </button>
          </form>
          <p className="text-[10px] text-[#747474] m-0 font-sans">
            Don't have an account?
            <span className="ml-1 text-[11px] underline underline-offset-2 text-teal-600 font-extrabold cursor-pointer font-sans">
              Sign up
            </span>
          </p>
          <div className="w-full flex flex-col justify-start mt-[20px] gap-[15px]">
            <div className="flex items-center justify-center gap-2 p-[10px_15px] bg-black text-white rounded-[20px] border-2 border-black cursor-pointer text-[11px] shadow-[0_10px_36px_0_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)] font-sans">
              <FaApple className="text-[18px] mb-[1px]" />
              <span>Log in with Apple</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-[10px_15px] border-2 border-[#747474] rounded-[20px] cursor-pointer text-[11px] shadow-[0_10px_36px_0_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)] font-sans">
              <FcGoogle className="text-[18px] mb-[1px]" />
              <span>Log in with Google</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Login;
