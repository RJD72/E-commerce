import { Link } from "react-router-dom";
import { XCircleIcon } from "@heroicons/react/24/solid";

const PaymentFailed = () => {
  return (
    <section className="max-w-3xl mx-auto p-6 flex flex-col items-center">
      {/* Failure Card */}
      <div className="rounded-xl border border-rose-200 bg-white p-8 shadow-sm text-center">
        <XCircleIcon className="w-20 h-20 text-rose-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-rose-700">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. This may be due to
          insufficient funds, incorrect details, or a connection issue.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/cart"
            className="px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700"
          >
            Try Again
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

export default PaymentFailed;
