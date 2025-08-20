import BackButton from "../components/BackButton";

const About = () => {
  return (
    <section className="max-w-5xl mx-auto p-6">
      <BackButton fallback="/" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">About Us</h2>
        <span className="text-sm text-gray-600">
          Learn who we are & what we do
        </span>
      </div>

      {/* Summary strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Founded</div>
            <div className="font-semibold">2025</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="font-semibold">Ontario, Canada</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Mission</div>
            <div className="font-semibold">
              Making e-commerce simple & elegant
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-3">Our Story</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          We started with a simple idea: build web experiences that are both
          functional and beautiful. Over time, that passion grew into a mission
          to help businesses and individuals create online presences they can be
          proud of.
        </p>
      </section>

      {/* What We Do */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-3">What We Do</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          From design to development, we focus on creating intuitive user
          experiences, modern interfaces, and scalable backend solutions.
          Whether it’s an e-commerce platform, a portfolio site, or something in
          between, we believe every project deserves attention to detail.
        </p>
      </section>

      {/* Team Section */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Meet the Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {["Rob", "Alex", "Taylor"].map((name, i) => (
            <div key={i} className="text-center">
              <img
                src={`https://via.placeholder.com/150x150.png?text=${name}`}
                alt={name}
                className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-indigo-800 shadow-md"
              />
              <h4 className="mt-3 font-semibold">{name}</h4>
              <p className="text-sm text-gray-500">Developer</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default About;
