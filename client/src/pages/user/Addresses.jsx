/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { toast, ToastContainer } from "react-toastify";

const Addresses = () => {
  // --- Form State Variables for Shipping Address ---
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // --- Form State Variables for Billing Address ---
  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingProvince, setBillingProvince] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  // Checkbox state for "same as shipping"
  const [sameAsShipping, setSameAsShipping] = useState(false);

  // Local validation error object (used to highlight empty fields)
  const [fieldErrors, setFieldErrors] = useState({});

  // Pull the user from the Redux store
  const user = useSelector((state) => state.auth.user);

  // Use RTK Query mutation for updating user
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();

  // Set up dispatch for updating user state in Redux
  const dispatch = useDispatch();

  // --- On Mount: Preload form fields from user state ---
  useEffect(() => {
    if (user) {
      setStreet(user.shippingAddress?.street || "");
      setCity(user.shippingAddress?.city || "");
      setProvince(user.shippingAddress?.province || "");
      setPostalCode(user.shippingAddress?.postalCode || "");
      setCountry(user.shippingAddress?.country || "");

      setBillingStreet(user.billingAddress?.street || "");
      setBillingCity(user.billingAddress?.city || "");
      setBillingProvince(user.billingAddress?.province || "");
      setBillingPostalCode(user.billingAddress?.postalCode || "");
      setBillingCountry(user.billingAddress?.country || "");
    }
  }, [user]);

  // --- When "same as shipping" is checked, sync billing fields ---
  useEffect(() => {
    if (sameAsShipping) {
      setBillingStreet(street);
      setBillingCity(city);
      setBillingProvince(province);
      setBillingPostalCode(postalCode);
      setBillingCountry(country);
    }
  }, [sameAsShipping, street, city, province, postalCode, country]);

  // --- Validate: Ensure all form fields are filled ---
  const validate = () => {
    const errs = {};

    // Shipping address validation
    if (!street.trim()) errs.street = "Street is required";
    if (!city.trim()) errs.city = "City is required";
    if (!province.trim()) errs.province = "Province is required";
    if (!postalCode.trim()) errs.postalCode = "Postal code is required";
    if (!country.trim()) errs.country = "Country is required";

    // Billing address validation
    if (!billingStreet.trim())
      errs.billingStreet = "Billing street is required";
    if (!billingCity.trim()) errs.billingCity = "Billing city is required";
    if (!billingProvince.trim())
      errs.billingProvince = "Billing province is required";
    if (!billingPostalCode.trim())
      errs.billingPostalCode = "Billing postal code is required";
    if (!billingCountry.trim())
      errs.billingCountry = "Billing country is required";

    // Store error flags for each invalid field
    setFieldErrors(errs);

    // Return true only if there are no errors
    return Object.keys(errs).length === 0;
  };

  // --- Handle form submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Abort if validation fails
    if (!validate()) {
      toast.error("Please fill in all required fields.", {
        position: "top-center",
        closeOnClick: true,
      });
      return;
    }

    // Prepare data to send to backend using FormData
    const formData = new FormData();

    // Add shipping address fields
    formData.append("shippingStreet", street);
    formData.append("shippingCity", city);
    formData.append("shippingProvince", province);
    formData.append("shippingPostalCode", postalCode);
    formData.append("shippingCountry", country);

    // Add billing address fields
    formData.append("billingStreet", billingStreet);
    formData.append("billingCity", billingCity);
    formData.append("billingProvince", billingProvince);
    formData.append("billingPostalCode", billingPostalCode);
    formData.append("billingCountry", billingCountry);

    try {
      // Send the update request to the backend
      const res = await updateUser(formData).unwrap();

      // If the update is successful, update Redux and show success toast
      if (res?.user) {
        dispatch(setCredentials({ user: res.user }));
        toast.success("Address updated successfully!");
      }
    } catch (err) {
      // Show error toast if something fails
      toast.error(err?.data?.message || "Failed to update address.");
    }
  };

  // 🔴 Shared styles for error highlighting
  const inputErrorClass = "border-red-500 ring-1 ring-red-300";

  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-210px)] px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-4xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] p-[30px] box-border">
        <BackButton fallback="/profile" />
        <h2 className="text-center text-[28px] font-extrabold mb-[30px] font-sans text-blue-900">
          Shipping & Billing Address
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Shipping */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-700">
              Shipping Address
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <FloatingInput
                label="Street"
                value={street}
                onChange={setStreet}
                error={!!fieldErrors.street}
                helperText={fieldErrors.street}
              />
              <FloatingInput
                label="City"
                value={city}
                onChange={setCity}
                error={!!fieldErrors.city}
                helperText={fieldErrors.city}
              />
            </div>
            <FloatingInput
              label="Province"
              value={province}
              onChange={setProvince}
              error={!!fieldErrors.province}
              helperText={fieldErrors.province}
            />
            <FloatingInput
              label="Postal Code"
              value={postalCode}
              onChange={setPostalCode}
              error={!!fieldErrors.postalCode}
              helperText={fieldErrors.postalCode}
            />
            <FloatingInput
              label="Country"
              value={country}
              onChange={setCountry}
              error={!!fieldErrors.country}
              helperText={fieldErrors.country}
            />
          </div>

          {/* Billing */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-700">Billing Address</h3>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                className="rounded text-indigo-600 focus:ring-0"
                checked={sameAsShipping}
                onChange={() => setSameAsShipping(!sameAsShipping)}
              />
              Same as shipping address
            </label>

            <div className="flex flex-col md:flex-row gap-4">
              <FloatingInput
                label="Street"
                value={billingStreet}
                onChange={setBillingStreet}
                error={!!fieldErrors.billingStreet}
                helperText={fieldErrors.billingStreet}
              />
              <FloatingInput
                label="City"
                value={billingCity}
                onChange={setBillingCity}
                error={!!fieldErrors.billingCity}
                helperText={fieldErrors.billingCity}
              />
            </div>
            <FloatingInput
              label="Province"
              value={billingProvince}
              onChange={setBillingProvince}
              error={!!fieldErrors.billingProvince}
              helperText={fieldErrors.billingProvince}
            />
            <FloatingInput
              label="Postal Code"
              value={billingPostalCode}
              onChange={setBillingPostalCode}
              error={!!fieldErrors.billingPostalCode}
              helperText={fieldErrors.billingPostalCode}
            />
            <FloatingInput
              label="Country"
              value={billingCountry}
              onChange={setBillingCountry}
              error={!!fieldErrors.billingCountry}
              helperText={fieldErrors.billingCountry}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-white transition ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-800 hover:bg-indigo-700"
              }`}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Addresses;
