import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Calendar, Edit2, Save, X } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import { toast } from "react-toastify";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Implement API call to update user profile
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-icon">
            <User size={40} />
          </div>
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">Manage your account information</p>
          </div>
        </motion.div>

        <div className="profile-layout">
          <motion.div
            className="profile-main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="profile-card-header">
                <h2>Account Information</h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    icon={Edit2}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">
                    <User size={18} />
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter username"
                    />
                  ) : (
                    <div className="form-value">{user?.username}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} />
                    Email Address
                  </label>
                  <div className="form-value">{user?.email}</div>
                  <div className="form-hint">
                    Email cannot be changed for security reasons
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Shield size={18} />
                    Role
                  </label>
                  <div className="form-value">
                    <span className={`role-badge ${user?.role?.toLowerCase()}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={18} />
                    Member Since
                  </label>
                  <div className="form-value">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <Button variant="outline" icon={X} onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button variant="primary" icon={Save} onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="profile-sidebar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <h3>{user?.username}</h3>
                <p className="user-email">{user?.email}</p>
              </div>
            </Card>

            <Card className="stats-card">
              <h3>Account Statistics</h3>
              <div className="stat-item">
                <span className="stat-label">Total Articles</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Published</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Review</span>
                <span className="stat-value">0</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
