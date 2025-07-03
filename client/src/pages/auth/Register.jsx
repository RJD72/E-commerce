import { Link } from "react-router-dom";
import Clothes from "../../assets/bag.jpg";
import { useState } from "react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };
  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-100px)]">
      <div className="flex flex-col md:flex-row justify-center items-center shadow-lg lg:gap-6 p-6 m-4 mx-auto rounded-lg">
        <div className="p-4">
          <img src={Clothes} alt="" className="rounded-lg" />
        </div>
        <div className="p-4 rounded-2xl w-full">
          <h2 className="text-2xl text-center mb-4">Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-4">
              <label htmlFor="firstName" className="ml-3 mb-1">
                First Name:
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded-full p-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="lastName" className="ml-3 mb-1">
                Last Name:
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded-full p-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="ml-3 mb-1">
                Email:
              </label>
              <input
                type="email"
                className="border border-gray-300 rounded-full p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="password" className="ml-3 mb-1">
                Password:
              </label>
              <input
                type="password"
                className="border border-gray-300 rounded-full p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="confirmPassword" className="ml-3 mb-1">
                Confirm Password:
              </label>
              <input
                type="password"
                className="border border-gray-300 rounded-full p-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="border border-gray-300 rounded-full p-2 w-full hover:cursor-pointer"
              >
                Register
              </button>
            </div>
            <div className="w-full mt-4">
              <hr className="text-gray-300" />
            </div>
          </form>

          <div className="mt-4">
            <p className="text-sm">
              Already have an account?{" "}
              <Link to={"/login"}>
                <span className="text-blue-500 underline hover:cursor-pointer hover:text-blue-700">
                  Log in here
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Register;
