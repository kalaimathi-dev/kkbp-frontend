import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Clock,
  Tag,
  ArrowLeft,
  Bookmark,
  Share2,
  Eye,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../utils/api";
import { toast } from "react-toastify";
import "./ArticleDetail.css";

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <div className="skeleton-article"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <Card className="error-card">
            <h2>Article Not Found</h2>
            <Button variant="primary" onClick={() => navigate("/articles")}>
              Back to Articles
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Back
          </Button>
        </motion.div>

        <div className="article-layout">
          {/* Main Content */}
          <motion.div
            className="article-main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="article-content-card">
              {/* Article Header */}
              <div className="article-header-section">
                {article.category && (
                  <span className="article-category-badge">
                    {article.category}
                  </span>
                )}
                <h1 className="article-title-large">{article.title}</h1>

                <div className="article-meta-info">
                  <div className="meta-group">
                    <div className="meta-item">
                      <User size={16} />
                      <span>{article.author}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>
                        {new Date(article.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>
                        {Math.ceil((article.content?.length || 0) / 1000)} min
                        read
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="article-body">
                {article.content?.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="article-tags-section">
                  <Tag size={18} />
                  <div className="tags-list">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="article-actions-bar">
                <Button
                  variant={bookmarked ? "primary" : "outline"}
                  icon={Bookmark}
                  onClick={handleBookmark}
                >
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
                <Button variant="outline" icon={Share2} onClick={handleShare}>
                  Share
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="article-sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Author Card */}
            <Card className="author-card">
              <h3 className="sidebar-title">About the Author</h3>
              <div className="author-info-card">
                <div className="author-avatar-large">
                  {article.author?.charAt(0).toUpperCase()}
                </div>
                <h4>{article.author}</h4>
                <p className="author-email">
                  {article.authorEmail || `${article.author}@kambaa.in`}
                </p>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="stats-card">
              <h3 className="sidebar-title">Article Stats</h3>
              <div className="stats-list">
                <div className="stat-item">
                  <Eye size={18} />
                  <div>
                    <div className="stat-value">{article.views || 0}</div>
                    <div className="stat-label">Views</div>
                  </div>
                </div>
                <div className="stat-item">
                  <Bookmark size={18} />
                  <div>
                    <div className="stat-value">{article.bookmarks || 0}</div>
                    <div className="stat-label">Bookmarks</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="quick-actions-card">
              <Button
                variant="primary"
                onClick={() => navigate("/submit")}
                fullWidth
              >
                Write an Article
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/articles")}
                fullWidth
              >
                Browse More Articles
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
