import { useState } from "react";
import { Link } from "react-router-dom";
import Clothes from "../../assets/bag.jpg";
import { useRegisterUserMutation } from "../../redux/api/authApiSlice";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }
    try {
      await registerUser({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      }).unwrap();
      toast.success("Verification email sent", {
        position: "top-center",
      });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed", {
        position: "top-center",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>{error.message}</p>;

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-110px)] md:px-4">
      <div className="flex flex-col md:flex-row justify-center items-center shadow-lg gap-6 p-6 mx-auto rounded-lg max-w-5xl w-full">
        <div className="hidden md:block flex-1">
          <img
            src={Clothes}
            alt="Clothing"
            className="rounded-lg h-[500px] object-cover w-full"
          />
        </div>

        <div className="w-full md:max-w-[400px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] px-2 py-6 md:p-[20px_30px] box-border">
          <p className="text-center text-[28px] font-extrabold mb-[30px] mt-[10px] font-sans">
            Create Account
          </p>
          <form
            className="w-full flex flex-col gap-[18px] mb-[15px]"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="First Name"
              className="rounded-full border border-gray-300 outline-none p-[12px_15px] box-border"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="rounded-full border border-gray-300 outline-none p-[12px_15px] box-border"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
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
            <input
              type="password"
              placeholder="Confirm Password"
              className="rounded-full border border-gray-300 outline-none p-[12px_15px] box-border"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
            >
              Sign up
            </button>
          </form>
          <p className="text-[10px] text-[#747474] m-0 font-sans">
            Already have an account?
            <Link
              to="/login"
              className="ml-1 text-[11px] underline underline-offset-2 text-blue-900 hover:text-blue-500 font-extrabold cursor-pointer font-sans"
            >
              Log in
            </Link>
          </p>
          <div className="w-full flex flex-col justify-start mt-[20px] gap-[15px]">
            <div className="flex items-center justify-center gap-2 p-[10px_15px] bg-black text-white rounded-[20px] border-2 border-black cursor-pointer text-[11px] shadow-md font-sans">
              <FaApple className="text-[18px]" />
              <span>Sign up with Apple</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-[10px_15px] border-2 border-[#747474] rounded-[20px] cursor-pointer text-[11px] shadow-md font-sans">
              <FcGoogle className="text-[18px]" />
              <span>Sign up with Google</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
