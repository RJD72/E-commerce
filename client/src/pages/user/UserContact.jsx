import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { toast } from "react-toastify";

/* --------------------------- Tiny UI helpers --------------------------- */
const Avatar = ({ src, alt, onClick }) => {
  const fallback = "https://via.placeholder.com/128x128.png?text=User";
  return (
    <img
      src={src || fallback}
      alt={alt || "Profile"}
      className="rounded-full w-32 h-32 border-4 border-indigo-800 object-cover shadow-md hover:scale-105 transition-transform cursor-pointer"
      onClick={onClick}
      loading="lazy"
    />
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="flex items-center justify-between md:block">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-semibold break-all">{value || "—"}</div>
  </div>
);

/* ------------------------------ Component ------------------------------ */
const UserContact = () => {
  // Local state mirrors original logic
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");

  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const dispatch = useDispatch();

  const handleClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
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

  const summary = useMemo(
    () => [
      { label: "Name", value: [firstName, lastName].filter(Boolean).join(" ") },
      { label: "Email", value: email },
      { label: "Phone", value: phone },
    ],
    [firstName, lastName, email, phone]
  );

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
      toast.error(
        error?.data?.message || error?.message || "Error updating user",
        {
          position: "top-center",
          closeOnClick: true,
        }
      );
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6">
      <BackButton fallback="/profile" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Contact Information</h2>
        {user?._id && (
          <span className="text-xs text-gray-500">
            ID: <span className="font-mono">{user._id}</span>
          </span>
        )}
      </div>

      {/* Avatar + Change button */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex flex-col items-center">
          <Avatar
            src={image || user?.profileImage}
            alt={`${firstName || ""} ${lastName || ""}`.trim() || "Profile"}
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
            className="mt-4 px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700 transition"
          >
            Change Profile Picture
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {summary.map((s) => (
            <SummaryItem key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* FloatingInput passes only value; we wire direct setters */}
          <FloatingInput
            label="First Name"
            value={firstName}
            onChange={setFirstName}
          />
          <FloatingInput
            label="Last Name"
            value={lastName}
            onChange={setLastName}
          />
        </div>

        <FloatingInput
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
        />
        <FloatingInput
          type="tel"
          label="Phone"
          value={phone}
          onChange={setPhone}
        />

        <div className="flex flex-col md:flex-row justify-center md:justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 rounded-full border hover:bg-gray-50"
            // Wire this when you add a flow:
            onClick={() => toast.info("Password reset flow coming soon")}
          >
            Reset Password
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700 disabled:opacity-60"
            aria-busy={isUpdating ? "true" : "false"}
          >
            {isUpdating ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default UserContact;
