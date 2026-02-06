import React from "react";
import { motion } from "framer-motion";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <motion.button
      className={`unique-btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <span className="btn-background"></span>
      <span className="btn-content">
        {loading ? (
          <span className="spinner-sm"></span>
        ) : (
          <>
            {Icon && <Icon className="btn-icon" size={18} />}
            {children}
          </>
        )}
      </span>
      <span className="btn-shine"></span>
    </motion.button>
  );
};

export default Button;
