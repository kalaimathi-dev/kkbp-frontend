import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Send,
  AlertCircle,
  Tag,
  FolderOpen,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../utils/api";
import { toast } from "react-toastify";
import "./SubmitArticle.css";

const SubmitArticle = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    excerpt: "",
  });
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "content") {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter content");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (formData.content.length < 100) {
      toast.error("Content must be at least 100 characters");
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const articleData = {
        ...formData,
        tags: tagsArray,
        status: "PENDING",
      };

      await api.post("/articles", articleData);

      toast.success("Article submitted for review!");
      navigate("/my-articles");
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error(error.response?.data?.message || "Failed to submit article");
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title to save draft");
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const articleData = {
        ...formData,
        tags: tagsArray,
        status: "DRAFT",
      };

      await api.post("/articles", articleData);

      toast.success("Draft saved successfully!");
      navigate("/my-articles");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-article-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-icon">
            <FileText size={40} />
          </div>
          <div>
            <h1 className="page-title">Submit New Article</h1>
            <p className="page-description">
              Share your knowledge with the team. Articles will be reviewed by
              admins before publishing.
            </p>
          </div>
        </motion.div>

        <div className="submit-layout">
          {/* Form */}
          <motion.div
            className="form-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <form onSubmit={handleSubmit} className="article-form">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">
                    <FileText size={18} />
                    Article Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a descriptive title..."
                    className="form-input"
                    maxLength={200}
                  />
                  <div className="form-hint">Make it clear and descriptive</div>
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">
                    <FolderOpen size={18} />
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-hint">
                    Choose the most relevant category
                  </div>
                </div>

                {/* Excerpt */}
                <div className="form-group">
                  <label className="form-label">
                    <AlertCircle size={18} />
                    Short Description (Optional)
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Brief summary of the article..."
                    className="form-textarea"
                    rows={2}
                    maxLength={200}
                  />
                  <div className="form-hint">
                    {formData.excerpt.length}/200 characters
                  </div>
                </div>

                {/* Content */}
                <div className="form-group">
                  <label className="form-label">
                    <FileText size={18} />
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your article content here..."
                    className="form-textarea content-textarea"
                    rows={15}
                  />
                  <div className="form-hint">
                    <span
                      className={
                        charCount < 100 ? "text-warning" : "text-success"
                      }
                    >
                      {charCount} characters{" "}
                      {charCount < 100 && `(minimum 100)`}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label className="form-label">
                    <Tag size={18} />
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Enter tags separated by commas (e.g., javascript, react, tutorial)"
                    className="form-input"
                  />
                  <div className="form-hint">
                    Add relevant keywords to help others find your article
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDraft}
                    loading={loading}
                    disabled={loading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Send}
                    loading={loading}
                    disabled={loading}
                  >
                    Submit for Review
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubmitArticle;
