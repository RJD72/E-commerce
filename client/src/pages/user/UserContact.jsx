/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import { distance } from "motion/react";

const UserContact = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");

  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
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
        console.log(res.message || "User updated successfully");
      }
    } catch (error) {
      console.log("Error updating user:", error.message);
    }
  };

  return (
    <>
      <section className="w-full">
        <div className="space-y-8 max-w-[960px] m-auto divide-y divide-gray-200">
          <BackButton fallback="/profile" />
          <div className="bg-gradient-to-r from-indigo-800 to-blue-900 flex items-center justify-center p-4 rounded-2xl">
            <div className="font-std mb-10 w-full rounded-2xl bg-white p-2 md:p-10 font-normal leading-relaxed text-gray-900 shadow-xl">
              <div className="flex flex-col">
                <div className="flex flex-col md:flex-row justify-between mb-5 items-start">
                  <h2 className="mb-5 text-4xl font-bold text-blue-900">
                    Contact Information
                  </h2>
                  <div className="text-center">
                    <div>
                      <img
                        src={image || user?.profileImage}
                        alt="Profile Picture"
                        className="rounded-full w-32 h-32 mx-auto border-4 border-indigo-800 mb-4 transition-transform duration-300 hover:scale-105 ring ring-gray-300 cursor-pointer"
                        onClick={handleClick}
                      />
                      <input
                        type="file"
                        name="profile"
                        id="upload_profile"
                        hidden
                        required
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleClick}
                      className="bg-gradient-to-r from-indigo-800 to-blue-900 text-white px-4 py-2 rounded-full hover:bg-red-900 transition-colors duration-300 ring ring-gray-300 hover:ring-indigo-300 cursor-pointer"
                    >
                      Change Profile Picture
                    </button>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      id="name"
                      placeholder="First Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />

                    <input
                      type="text"
                      id="title"
                      placeholder="Last Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      id="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row justify-center md:justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-indigo-800 text-white rounded-full hover:bg-indigo-700"
                    >
                      Reset Password
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-800 text-white rounded-full hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default UserContact;
