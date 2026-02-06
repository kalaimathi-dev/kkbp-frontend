import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  FileText,
  PlusCircle,
  User,
  LogOut,
  Shield,
  MessageCircle,
} from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    ...(!isAdmin ? [{ path: "/", label: "Home", icon: Home }] : []),
    { path: "/articles", label: "Articles", icon: FileText },
    { path: "/chatbot", label: "AI Assistant", icon: MessageCircle },
    ...(user && !isAdmin
      ? [{ path: "/submit", label: "Submit Article", icon: PlusCircle }]
      : []),
    ...(isAdmin
      ? [{ path: "/admin", label: "Admin Dashboard", icon: Shield }]
      : []),
    ...(user && !isAdmin
      ? [{ path: "/my-articles", label: "My Articles", icon: User }]
      : []),
  ];

  return (
    <motion.nav
      className="navbar glass-effect"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <motion.div
            className="brand-icon"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/images.png"
              alt="Kambaa Logo"
              style={{
                width: "55px",
                height: "55px",
                objectFit: "contain",
              }}
            />
          </motion.div>
          <span className="brand-text text-gradient">
            Kambaa Knowledge Base Portal
          </span>
        </Link>

        <div className="nav-links">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div key={item.path} whileHover={{ y: -2 }}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="active-indicator"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="nav-actions">
          {user && (
            <>
              <Link to="/profile">
                <motion.div className="user-badge" whileHover={{ scale: 1.05 }}>
                  <div className="user-avatar">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </motion.div>
              </Link>

              <motion.button
                className="btn-logout"
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
