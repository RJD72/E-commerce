import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Clothes from "./../../assets/clothes.jpg";
import { useDispatch } from "react-redux";
import { useLoginUserMutation } from "../../redux/api/authApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import FloatingInput from "../../components/FloatingInput";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser] = useLoginUserMutation();

  const validate = () => {
    const errs = {};

    if (!email.trim()) errs.email = "Email is required";
    if (!password.trim()) errs.password = "Password is required";

    setFieldErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        closeOnClick: true,
      });
      return;
    }

    try {
      // 1. Call the login endpoint with credentials
      const res = await loginUser({ email, password }).unwrap();

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

      //2. Dispatch to authSlice to store token and user in Redux
      dispatch(
        setCredentials({ accessToken: res.accessToken, user: res.user })
      );
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      const errorMsg = error.data.message;
      setLoginError(errorMsg);
      setEmail("");
      setPassword("");

      if (errorMsg?.includes("not been verified")) {
        navigate("/resend-verification");
      }
    }
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-110px)]">
      <div className="flex flex-col md:flex-row justify-center items-center shadow-lg lg:gap-6 p-6 m-4 mx-auto rounded-lg">
        <div className="hidden md:inline">
          <img src={Clothes} alt="" className="rounded-lg h-[500px]" />
        </div>
        <div className="w-[350px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[20px_30px] box-border">
          <p className="text-center text-[28px] font-extrabold mb-[30px] mt-[10px] font-sans">
            Welcome back
          </p>
          <p className="text-red-500 text-center mb-4">{loginError}</p>
          <form
            className="w-full flex flex-col gap-[18px] mb-[15px]"
            onSubmit={handleSubmit}
          >
            <FloatingInput
              label="Email"
              value={email}
              onChange={setEmail}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <FloatingInput
              label="Password"
              value={password}
              onChange={setPassword}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />

            <p className="text-end underline text-[#747474] underline-offset-2 m-0">
              <Link
                to={"/forgot-password"}
                className="cursor-pointer text-[9px] font-bold hover:text-black font-sans"
              >
                Forgot Password?
              </Link>
            </p>
            <button
              type="submit"
              className="p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
            >
              Log in
            </button>
          </form>
          <p className="text-[10px] text-[#747474] m-0 font-sans">
            Don't have an account?
            <Link
              to={"/register"}
              className="ml-1 text-[11px] underline underline-offset-2 text-blue-900 hover:text-blue-500 font-extrabold cursor-pointer font-sans"
            >
              Sign up
            </Link>
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
