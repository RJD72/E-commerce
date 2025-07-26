/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const EditCategoryModal = ({
  isOpen,
  initialValue = "",
  title = "Edit Category",
  onCancel,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue); // Reset input when modal opens with a new value
  }, [initialValue, isOpen]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div
            className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl absolute"
            variants={modalVariants}
          >
            <h2 className="text-lg font-bold mb-3 text-gray-800">{title}</h2>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter new category name"
              className="w-full px-4 py-2 border border-gray-300 rounded-full mb-6 focus:outline-none focus:ring-2 focus:ring-warm-taupe"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
              >
                Update
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditCategoryModal;
