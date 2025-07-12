/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "motion/react";

const BackButton = ({ fallback = "/" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <motion.button
      onClick={handleBack}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-white hover:bg-blue-900 rounded-md transition-colors shadow-sm"
    >
      <FaArrowLeft className="text-lg" />
      Back
    </motion.button>
  );
};

export default BackButton;
