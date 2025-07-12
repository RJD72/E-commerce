
import { useState } from "react";
import { useResendVerificationMutation } from "../redux/api/authApiSlice";

const VerificationModal = ({ onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[350px] bg-white shadow-lg rounded-[10px] p-6">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Your account has not been verified. Please enter your email below to resend the verification link.
        </p>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-full p-2 mb-4"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {status && (
          <p className="text-xs text-center text-red-500 mb-2">{status}</p>
        )}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-gray-700 border border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleResend}
            className="px-4 py-2 rounded-full text-white bg-gradient-to-r from-indigo-800 to-blue-900 hover:from-indigo-700 hover:to-blue-800"
          >
            Resend Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
