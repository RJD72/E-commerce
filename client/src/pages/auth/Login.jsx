import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-100px)]">
      <div className="w-[400px] shadow-lg p-4 rounded-2xl">
        <h2 className="text-2xl text-center">Log In</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              className="border border-gray-300 rounded-full p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              className="border border-gray-300 rounded-full p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mt-8">
            <button
              type="submit"
              className="border border-gray-300 rounded-full p-2 w-full hover:cursor-pointer"
            >
              Log in
            </button>
          </div>
          <div className="w-full mt-4">
            <hr className="text-gray-300" />
          </div>
        </form>

        <div className="mt-4">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to={"/register"}>
              <span className="text-blue-500 underline hover:cursor-pointer hover:text-blue-700">
                Register here
              </span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};
export default Login;
