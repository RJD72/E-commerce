import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import FloatingInput from "../components/FloatingInput";
import { toast } from "react-toastify";

const Contact = () => {
  const navigate = useNavigate();

  // FloatingInput passes only VALUE, so use simple setters
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const summary = useMemo(
    () => [
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Subject", value: subject },
    ],
    [name, email, subject]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // basic client-side checks (optional, just for looks)
    if (!name.trim()) return toast.error("Please enter your name.");
    if (!email.trim()) return toast.error("Please enter your email.");
    if (!subject.trim()) return toast.error("Please enter a subject.");
    if (!message.trim()) return toast.error("Please enter a message.");

    toast.success("Thanks! Your message has been sent.");
    // pretend we did work; then navigate home
    setTimeout(() => navigate("/"), 900);
  };

  return (
    <section className="max-w-4xl mx-auto p-6">
      <BackButton fallback="/" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <span className="text-sm text-gray-600">
          We'd love to hear from you.
        </span>
      </div>

      {/* Summary strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {summary.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between md:block"
            >
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="font-semibold break-all">{s.value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4"
      >
        {/* FloatingInput sends value only; wire direct setters */}
        <FloatingInput label="Your Name" value={name} onChange={setName} />
        <FloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
        />
        <FloatingInput label="Subject" value={subject} onChange={setSubject} />

        {/* Message textarea (styled to match) */}
        <div className="mt-2">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="contact-message"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            className="w-full min-h-[140px] rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us what's on your mind…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="mt-1 text-xs text-gray-500">
            We usually respond within 1–2 business days.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 rounded-full border hover:bg-gray-50"
            onClick={() => {
              setName("");
              setEmail("");
              setSubject("");
              setMessage("");
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-indigo-800 text-white hover:bg-indigo-700"
          >
            Send Message
          </button>
        </div>
      </form>
    </section>
  );
};

export default Contact;
