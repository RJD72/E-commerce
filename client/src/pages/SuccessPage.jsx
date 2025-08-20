import { Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const PaymentSuccess = () => {
  return (
    <section className="max-w-3xl mx-auto p-6 flex flex-col items-center">
      {/* Success Card */}
      <div className="rounded-xl border border-green-200 bg-white p-8 shadow-sm text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase! Your payment has been processed
          successfully.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/profile/orders"
            className="px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700"
          >
            View My Orders
          </Link>
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

export default PaymentSuccess;
