import { Link } from "react-router-dom";

const Register = () => {
  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-100px)]">
      <div className="w-[400px] shadow-lg p-4 rounded-2xl">
        <form action="">
          <div className="flex flex-col">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              className="border border-gray-300 rounded-full p-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              className="border border-gray-300 rounded-full p-2"
            />
          </div>
          <div className="mt-8">
            <button className="border border-gray-300 rounded-full p-2 w-full hover:cursor-pointer">
              Log in
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
    </section>
  );
};
export default Register;
