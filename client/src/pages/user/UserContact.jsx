import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { toast } from "react-toastify";

const UserContact = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");

  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setImage(user.profileImage || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("email", email);
    if (fileInputRef.current?.files?.length > 0) {
      formData.append("profileImage", fileInputRef.current.files[0]);
    }

    try {
      const res = await updateUser(formData).unwrap();
      if (res?.user) {
        dispatch(setCredentials({ user: res.user }));
        toast.success(res.message || "User updated successfully", {
          position: "top-center",
          closeOnClick: true,
        });
      }
    } catch (error) {
      toast.error(`Error updating user:${error.message}`, {
        position: "top-center",
        closeOnClick: true,
      });
    }
  };

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-210px)] px-4">
      <div className="w-full max-w-4xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[30px] box-border">
        <BackButton fallback="/profile" />

        <h2 className="text-center text-[28px] font-extrabold mb-[30px] font-sans text-blue-900">
          Contact Information
        </h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src={image || user?.profileImage}
            alt="Profile"
            className="rounded-full w-32 h-32 border-4 border-indigo-800 mb-4 object-cover shadow-md hover:scale-105 transition-transform cursor-pointer"
            onClick={handleClick}
          />
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={handleClick}
            className="px-4 py-2 bg-gradient-to-r from-indigo-800 to-blue-900 text-white rounded-full hover:from-indigo-700 hover:to-blue-800 transition-colors"
          >
            Change Profile Picture
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <FloatingInput
              label={"First Name"}
              value={firstName}
              onChange={setFirstName}
            />

            <FloatingInput
              label={"Last Name"}
              value={lastName}
              onChange={setLastName}
            />
          </div>
          <FloatingInput
            type="email"
            label={"Email"}
            value={email}
            onChange={setEmail}
          />
          <FloatingInput
            type="tel"
            label={"Phone"}
            value={phone}
            onChange={setPhone}
          />

          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-indigo-800 text-white rounded-full hover:bg-indigo-700 transition"
            >
              Reset Password
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-800 text-white rounded-full hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UserContact;
