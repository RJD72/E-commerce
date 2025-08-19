/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/authSlice";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { toast, ToastContainer } from "react-toastify";

const Addresses = () => {
  // --- Shipping address state ---
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // --- Billing address state ---
  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingProvince, setBillingProvince] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  // Checkbox: billing same as shipping
  const [sameAsShipping, setSameAsShipping] = useState(false);

  // Validation flags
  const [fieldErrors, setFieldErrors] = useState({});

  const user = useSelector((state) => state.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const dispatch = useDispatch();

  // Prefill from user profile
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

  // Keep billing in sync when "same as shipping" is enabled
  useEffect(() => {
    if (sameAsShipping) {
      setBillingStreet(street);
      setBillingCity(city);
      setBillingProvince(province);
      setBillingPostalCode(postalCode);
      setBillingCountry(country);
    }
  }, [sameAsShipping, street, city, province, postalCode, country]);

  // Simple required-field validation
  const validate = () => {
    const errs = {};
    // Shipping
    if (!street.trim()) errs.street = "Street is required";
    if (!city.trim()) errs.city = "City is required";
    if (!province.trim()) errs.province = "Province is required";
    if (!postalCode.trim()) errs.postalCode = "Postal code is required";
    if (!country.trim()) errs.country = "Country is required";
    // Billing
    if (!billingStreet.trim())
      errs.billingStreet = "Billing street is required";
    if (!billingCity.trim()) errs.billingCity = "Billing city is required";
    if (!billingProvince.trim())
      errs.billingProvince = "Billing province is required";
    if (!billingPostalCode.trim())
      errs.billingPostalCode = "Billing postal code is required";
    if (!billingCountry.trim())
      errs.billingCountry = "Billing country is required";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit (FormData keys preserved)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields.", {
        position: "top-center",
        closeOnClick: true,
      });
      return;
    }
    const formData = new FormData();
    // Shipping
    formData.append("shippingStreet", street);
    formData.append("shippingCity", city);
    formData.append("shippingProvince", province);
    formData.append("shippingPostalCode", postalCode);
    formData.append("shippingCountry", country);
    // Billing
    formData.append("billingStreet", billingStreet);
    formData.append("billingCity", billingCity);
    formData.append("billingProvince", billingProvince);
    formData.append("billingPostalCode", billingPostalCode);
    formData.append("billingCountry", billingCountry);

    try {
      const res = await updateUser(formData).unwrap();
      if (res?.user) {
        dispatch(setCredentials({ user: res.user }));
        toast.success("Address updated successfully!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update address.");
    }
  };

  // Summary strip content
  const shippingSummary = useMemo(() => {
    const l1 = [street].filter(Boolean).join(" ");
    const l2 = [city, province, postalCode].filter(Boolean).join(", ");
    return [l1, l2, country].filter(Boolean).join(" · ");
  }, [street, city, province, postalCode, country]);

  const billingSummary = useMemo(() => {
    const l1 = [billingStreet].filter(Boolean).join(" ");
    const l2 = [billingCity, billingProvince, billingPostalCode]
      .filter(Boolean)
      .join(", ");
    return [l1, l2, billingCountry].filter(Boolean).join(" · ");
  }, [
    billingStreet,
    billingCity,
    billingProvince,
    billingPostalCode,
    billingCountry,
  ]);

  return (
    <section className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <BackButton fallback="/profile" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Shipping &amp; Billing Address</h2>
        {user?._id && (
          <span className="text-xs text-gray-500">
            ID: <span className="font-mono">{user._id}</span>
          </span>
        )}
      </div>

      {/* Summary strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between md:block">
            <div className="text-xs text-gray-500">Shipping</div>
            <div className="font-semibold break-all">
              {shippingSummary || "—"}
            </div>
          </div>
          <div className="flex items-center justify-between md:block">
            <div className="text-xs text-gray-500">Billing</div>
            <div className="font-semibold break-all">
              {billingSummary || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Form cards */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Card */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
        </section>

        {/* Billing Card */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Billing Address</h3>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                className="rounded text-indigo-600 focus:ring-0"
                checked={sameAsShipping}
                onChange={() => setSameAsShipping(!sameAsShipping)}
              />
              Same as shipping
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
        </section>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-center md:justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-full text-white transition ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-800 hover:bg-indigo-700"
            }`}
            aria-busy={isLoading ? "true" : "false"}
          >
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Addresses;
