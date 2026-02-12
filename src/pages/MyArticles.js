import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../utils/api";
import { toast } from "react-toastify";
import "./MyArticles.css";

const MyArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/articles/my-articles");
      const allArticles = response.data || [];

      // Calculate stats
      const newStats = {
        total: allArticles.length,
        pending: allArticles.filter((a) => a.status === "PENDING").length,
        approved: allArticles.filter((a) => a.status === "APPROVED").length,
        rejected: allArticles.filter((a) => a.status === "REJECTED").length,
        draft: allArticles.filter((a) => a.status === "DRAFT").length,
      };
      setStats(newStats);

      // Filter articles
      let filtered = allArticles;
      if (filter !== "all") {
        filtered = allArticles.filter((a) => a.status === filter.toUpperCase());
      }

      setArticles(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      await api.delete(`/articles/${id}`);
      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock size={16} className="status-icon pending" />;
      case "APPROVED":
        return <CheckCircle size={16} className="status-icon approved" />;
      case "REJECTED":
        return <XCircle size={16} className="status-icon rejected" />;
      case "DRAFT":
        return <FileText size={16} className="status-icon draft" />;
      default:
        return <AlertCircle size={16} className="status-icon" />;
    }
  };

  return (
    <div className="my-articles-page">
      <div className="container">
        {/* Page Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="page-title">My Articles</h1>
            <p className="page-description">
              Manage your submitted articles and drafts
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/submit")}
            icon={FileText}
          >
            New Article
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {[
            { label: "All", value: stats.total, color: "blue", filter: "all" },
            {
              label: "Drafts",
              value: stats.draft,
              color: "gray",
              filter: "draft",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "yellow",
              filter: "pending",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "green",
              filter: "approved",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "red",
              filter: "rejected",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                hover
                className={`stat-card ${filter === stat.filter ? "active" : ""} ${stat.color}`}
                onClick={() => setFilter(stat.filter)}
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="articles-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card className="empty-state">
            <motion.div
              className="empty-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FileText size={64} className="empty-icon" />
              <h3>No articles found</h3>
              <p>
                {filter === "all"
                  ? "You haven't submitted any articles yet"
                  : `No ${filter} articles found`}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/submit")}
                icon={FileText}
              >
                Create Your First Article
              </Button>
            </motion.div>
          </Card>
        ) : (
          <div className="articles-list">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover>
                  <div className="my-article-item">
                    <div className="article-main">
                      <div className="article-status-badge">
                        {getStatusIcon(article.status)}
                        <span
                          className={`status-text ${article.status.toLowerCase()}`}
                        >
                          {article.status}
                        </span>
                      </div>

                      <h3 className="article-title">{article.title}</h3>

                      {article.excerpt && (
                        <p className="article-excerpt">
                          {article.excerpt.replace(/<[^>]*>/g, '')}
                        </p>
                      )}

                      <div className="article-meta">
                        <span className="meta-item">
                          Created:{" "}
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                        {article.category && (
                          <span className="category-badge">
                            {article.category}
                          </span>
                        )}
                      </div>

                      {article.status === "REJECTED" &&
                        article.rejectionReason && (
                          <div className="rejection-reason">
                            <AlertCircle size={16} />
                            <span>
                              <strong>Reason:</strong> {article.rejectionReason}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="article-actions">
                      {article.status === "APPROVED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => navigate(`/articles/${article.id}`)}
                        >
                          View
                        </Button>
                      )}

                      {(article.status === "DRAFT" ||
                        article.status === "REJECTED") && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          onClick={() => navigate(`/edit/${article.id}`)}
                        >
                          Edit
                        </Button>
                      )}

                      {article.status !== "APPROVED" && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(article.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyArticles;
