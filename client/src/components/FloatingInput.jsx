/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const FloatingInput = ({
  type = "text",
  id,
  name,
  label,
  value,
  onChange,
  error,
  helperText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive =
    isFocused ||
    (typeof value === "string" ? value.trim().length > 0 : !!value);

  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="relative w-full font-[Segoe UI]">
      <input
        type={type}
        name={name}
        id={inputId}
        value={value || ""}
        onChange={(e) => {
          if (typeof onChange === "function") {
            onChange(e.target.value);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
        className={`
          peer w-full px-4 py-3 text-base bg-transparent border-2 rounded-full outline-none transition-all
          ${
            error
              ? "border-red-500 ring-1 ring-red-300"
              : "border-gray-300 focus:border-indigo-400"
          }
        `}
      />

      <AnimatePresence>
        {isActive && (
          <motion.label
            htmlFor={inputId}
            initial={{ y: 12, scale: 1, opacity: 0 }}
            animate={{ y: -12, scale: 0.9, opacity: 1 }}
            exit={{ y: 12, scale: 1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
              absolute left-4 top-2.5 text-base text-gray-600 pointer-events-none transition-all
              peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:bg-white
              peer-valid:-translate-y-2 peer-valid:scale-90 peer-valid:bg-white
              ${
                isActive
                  ? "-translate-y-2 scale-90 bg-white px-1 text-sm rounded"
                  : ""
              }
            `}
          >
            {label}
          </motion.label>
        )}

        {!isActive && (
          <motion.label
            htmlFor={inputId}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 top-3.5 text-base text-gray-600 pointer-events-none"
          >
            {label}
          </motion.label>
        )}
      </AnimatePresence>

      {helperText && (
        <p className="text-red-500 text-xs mt-1 ml-2">{helperText}</p>
      )}
    </div>
  );
};

export default FloatingInput;
