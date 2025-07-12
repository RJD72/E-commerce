import { useState } from "react";
import { toast } from "react-toastify";
import { useResetPasswordMutation } from "../redux/api/authApiSlice";
import FloatingInput from "../components/FloatingInput";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState({});
  const { token } = useParams();

  const [resetPassword] = useResetPasswordMutation();

  const validate = () => {
    const errs = {};

    if (!password.trim()) errs.password = "Password is required";
    if (!confirmPassword.trim())
      errs.confirmPassword = "Confirm password is required";

    setFieldError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        closeOnClick: true,
      });
      return;
    }
    try {
      const res = await resetPassword({
        token,
        password,
        confirmPassword,
      }).unwrap();
      toast.success(res.message, {
        position: "top-center",
        closeOnClick: true,
      });
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.data?.message || "Error resending email.", {
        position: "top-center",
        closeOnClick: true,
      });
    }
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-110px)]">
      <div className="w-[350px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[20px_30px] box-border">
        <p className="text-center text-[24px] font-extrabold mb-[20px] mt-[10px] font-sans text-gray-800">
          Enter your new password
        </p>
        <p className="text-sm text-gray-600 text-center mb-4">
          Please enter your email address below to reset your password.
        </p>

        <div className="space-y-4">
          <FloatingInput
            type="password"
            label={"Password"}
            value={password}
            onChange={setPassword}
            error={!!fieldError.password}
            helperText={fieldError.Password}
          />
          <FloatingInput
            type="password"
            label={"Confirm Password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={!!fieldError.confirmPassword}
            helperText={fieldError.confirmPassword}
          />
        </div>
        <button
          onClick={handleReset}
          className="w-full p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer mt-4"
        >
          Reset Password
        </button>
      </div>
    </section>
  );
};
export default ResetPassword;
