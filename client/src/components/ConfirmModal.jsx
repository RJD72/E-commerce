/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "motion/react";

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

const ConfirmModal = ({ isOpen, title, message, onCancel, onConfirm }) => {
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
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
