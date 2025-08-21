import { Link, useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const EmailVerified = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-3xl mx-auto p-6 flex flex-col items-center">
      {/* Success Card */}
      <div className="rounded-2xl border border-green-200 bg-white p-8 shadow-sm text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-1">Email Verified</h2>
        <p className="text-gray-600 mb-6">
          Thanks! Your email address has been confirmed. You can now log in to
          your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700"
          >
            Continue to Login
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-full border hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EmailVerified;
