/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const MotionButton = ({ text, icon }) => {
  return (
    <motion.button
      className="relative overflow-hidden rounded-full p-[10px_15px] w-full font-semibold cursor-pointer bg-off-white-linen"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* Diagonal Sliding Overlay (with rounded corners) */}
      <motion.div
        className="absolute inset-0 z-0 rounded-full" // Apply rounded-full here
        variants={{
          rest: { x: "-100%", y: "100%" }, // Starts at bottom-left
          hover: { x: "0%", y: "0%" }, // Moves to top-right
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          backgroundColor: "var(--color-midnight-navy)",
        }}
      />

      {/* Text that fades to white */}
      <motion.span
        className="relative z-10  text-center flex justify-center items-center gap-2 "
        variants={{
          rest: {
            color: "#7F8C8D", // initial slate gray
          },
          hover: {
            color: "#ffffff", // animate to white
          },
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {text}
        {icon}
      </motion.span>
    </motion.button>
  );
};

export default MotionButton;
