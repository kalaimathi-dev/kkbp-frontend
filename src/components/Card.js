import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

const Card = ({
  children,
  hover = true,
  glow = false,
  className = "",
  onClick,
  delay = 0,
}) => {
  return (
    <motion.div
      className={`unique-card ${glow ? "glow-effect" : ""} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={
        hover
          ? {
              y: -8,
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(28, 77, 141, 0.25)",
              transition: { duration: 0.3 },
            }
          : {}
      }
      onClick={onClick}
    >
      <div className="card-shimmer"></div>
      <div className="card-content">{children}</div>
      <div className="card-border-gradient"></div>
    </motion.div>
  );
};

export default Card;
