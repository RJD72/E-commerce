import { useState } from "react";
import { useResendVerificationMutation } from "../../redux/api/authApiSlice";

const ResendVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [resendVerification] = useResendVerificationMutation();
  const [status, setStatus] = useState("");

  const handleResend = async () => {
    try {
      const res = await resendVerification({ email }).unwrap();
      setStatus(res.message);
    } catch (err) {
      setStatus(err?.data?.message || "Error resending email.");
    }
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-110px)]">
      <div className="w-[350px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[20px_30px] box-border">
        <p className="text-center text-[24px] font-extrabold mb-[20px] mt-[10px] font-sans text-gray-800">
          Email Verification
        </p>
        <p className="text-sm text-gray-600 text-center mb-4">
          Please enter your email address below to resend the verification link.
        </p>
        <input
          type="email"
          className="w-full rounded-full border border-gray-300 outline-none p-[12px_15px] mb-3 box-border"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {status && (
          <p className="text-xs text-center text-red-500 mb-2">{status}</p>
        )}
        <button
          onClick={handleResend}
          className="w-full p-[10px_15px] rounded-full bg-gradient-to-r from-indigo-800 to-blue-900 text-white font-sans font-medium shadow-md active:shadow-none transition cursor-pointer"
        >
          Resend Verification Email
        </button>
      </div>
    </section>
  );
};

export default ResendVerificationPage;
