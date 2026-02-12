import React, { useState, useEffect, useMemo } from "react";
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
  FileText,
  ExternalLink,
} from "lucide-react";
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import DOMPurify from 'dompurify';
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

  // Helper function to decode HTML entities and detect content type
  const decodeHTML = (html) => {
    if (!html) return '';
    
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    let decoded = txt.value;
    
    // Decode again if still encoded (double encoding case)
    if (decoded.includes('&lt;') || decoded.includes('&gt;') || decoded.includes('&amp;')) {
      txt.innerHTML = decoded;
      decoded = txt.value;
    }
    
    console.log('Original content length:', html?.length);
    console.log('Decoded content length:', decoded?.length);
    console.log('First 200 chars of original:', html?.substring(0, 200));
    console.log('First 200 chars of decoded:', decoded?.substring(0, 200));
    console.log('Contains HTML tags:', decoded.includes('<'));
    
    // Check if this is actually HTML content or just plain text showing HTML
    // If the original starts with HTML tags (not encoded), it's plain text being displayed
    const startsWithHTMLTag = /^[\s]*<(h[1-6]|p|div|span|strong|em|ul|ol|li|pre|code|blockquote)[\s>]/i.test(html);
    const hasRichTextFeatures = html.includes('<strong>') || html.includes('<em>') || html.includes('<p>') || html.includes('<h1>') || html.includes('<h2>') || html.includes('<img');
    
    console.log('Starts with HTML tag:', startsWithHTMLTag);
    console.log('Has rich text features:', hasRichTextFeatures);
    
    return decoded;
  };

  // Sanitize and process HTML content
  const sanitizedContent = useMemo(() => {
    if (!article || !article.content) return '';
    
    let content = article.content;
    
    // Decode HTML entities if content is escaped (handles single and double encoding)
    content = decodeHTML(content);
    
    // Configure DOMPurify to allow all safe HTML and attributes
    const config = {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling']
    };
    
    const sanitized = DOMPurify.sanitize(content, config);
    console.log('Sanitized content length:', sanitized?.length);
    console.log('First 200 chars of sanitized:', sanitized?.substring(0, 200));
    
    return sanitized;
  }, [article]);

  useEffect(() => {
    // Apply syntax highlighting to code blocks after content loads
    if (article && sanitizedContent) {
      setTimeout(() => {
        document.querySelectorAll('.article-body pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }, 100);
    }
  }, [article, sanitizedContent]);

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
              <div 
                className="article-body rich-text-content"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* PDF Viewer */}
              {article.pdfFile && (
                <div className="article-pdf-section">
                  <div className="pdf-section-header">
                    <FileText size={20} />
                    <h3>Attached Document</h3>
                  </div>
                  <div className="pdf-viewer-container">
                    <div className="pdf-viewer-header">
                      <FileText size={16} />
                      <span className="pdf-name">{article.pdfOriginalName || 'Document.pdf'}</span>
                    </div>
                    <div className="pdf-viewer-frame">
                      <iframe
                        src={`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/articles/pdf/${article.pdfFile}`}
                        title={article.pdfOriginalName || 'PDF Document'}
                        width="100%"
                        height="600px"
                        style={{ border: 'none' }}
                      />
                    </div>
                    <div className="pdf-viewer-actions">
                      <a
                        href={`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/articles/pdf/${article.pdfFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-action-link"
                      >
                        <ExternalLink size={16} />
                        Open PDF in new tab
                      </a>
                    </div>
                  </div>
                </div>
              )}

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
