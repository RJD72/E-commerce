import BackButton from "../components/BackButton";

const Privacy = () => {
  return (
    <section className="max-w-5xl mx-auto p-6">
      <BackButton fallback="/" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Privacy Policy</h2>
        <span className="text-sm text-gray-600">
          How we handle your information
        </span>
      </div>

      {/* Summary strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Effective Date</div>
            <div className="font-semibold">January 1, 2025</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Updated</div>
            <div className="font-semibold">August 2025</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Applies To</div>
            <div className="font-semibold">All visitors & users</div>
          </div>
        </div>
      </div>

      {/* Policy Sections */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          We may collect basic personal information such as your name, email,
          and contact details when you use our services or interact with our
          site. This information helps us provide a better experience.
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-3">How We Use Your Data</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Information collected is used strictly for service delivery, customer
          support, and occasional updates. We will never sell your personal data
          to third parties.
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-3">Cookies</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Our site may use cookies to enhance user experience and track general
          usage data. You can disable cookies in your browser settings at any
          time.
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          You have the right to request a copy of your data, update your
          information, or request deletion at any time by contacting us.
        </p>
      </section>
    </section>
  );
};

export default Privacy;
