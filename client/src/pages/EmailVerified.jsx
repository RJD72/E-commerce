import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
  const navigate = useNavigate();
  return (
    <section className="flex justify-center items-center">
      <div className="border border-gray-300 flex flex-col">
        <div>EmailVerified</div>
        <button onClick={() => navigate("/login")}>Log in</button>
      </div>
    </section>
  );
};
export default EmailVerified;
