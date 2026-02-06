import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Button from "../components/Button";
import { toast } from "react-toastify";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email domain
    if (!formData.email.endsWith("@kambaa.in")) {
      toast.error("Please use your @kambaa.in email address");
      return;
    }

    setLoading(true);
    try {
      const userData = await login(formData.email, formData.password);
      console.log("Login successful, user data:", userData);
      toast.success("Welcome back!");
      // Force page reload to ensure state is updated
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <motion.div
        className="auth-card glass-effect"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-header">
          <motion.div
            className="auth-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/images.png"
              alt="Kambaa Logo"
              style={{ width: "120px", height: "120px", objectFit: "contain" }}
            />
          </motion.div>
          <h1 className="auth-title text-gradient">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your knowledge portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.name@kambaa.in"
                className="form-input"
                required
              />
              <div className="input-border"></div>
            </div>
            <span className="form-hint">Use your @kambaa.in email</span>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Password
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="input-border"></div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={ArrowRight}
            loading={loading}
            className="auth-submit"
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <Link to="/register" className="auth-link">
            Create Account <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
