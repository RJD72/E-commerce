import { useState } from "react";
import { useForgotPasswordMutation } from "../redux/api/authApiSlice";
import FloatingInput from "../components/FloatingInput";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgotPassword] = useForgotPasswordMutation();

  const validate = () => {
    const errs = {};

    if (!email.trim()) errs.email = "Your Email is required";

    setFieldError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResend = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!validate()) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        closeOnClick: true,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.success(res.message, {
        position: "top-center",
        closeOnClick: true,
      });
      setEmail("");
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "Error resending email.", {
        position: "top-center",
        closeOnClick: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-110px)]">
      <div className="w-[350px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[20px_30px] box-border">
        <p className="text-center text-[24px] font-extrabold mb-[20px] mt-[10px] font-sans text-gray-800">
          Enter your Email
        </p>
        <p className="text-sm text-gray-600 text-center mb-4">
          Please enter your email address below to reset your password.
        </p>

        <FloatingInput
          type="email"
          label={"Email"}
          value={email}
          onChange={setEmail}
          error={!!fieldError.email}
          helperText={fieldError.email}
        />

        <button
          onClick={handleResend}
          className="w-full p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer mt-4"
        >
          {loading ? "Loading..." : "Send Password Link"}
        </button>
      </div>
    </section>
  );
};
export default ForgotPasswordForm;
