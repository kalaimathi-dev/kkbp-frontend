import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./Home.css";

const Home = () => {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    contributors: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes] = await Promise.all([
        api.get("/articles?status=APPROVED&limit=6"),
      ]);

      setArticles(articlesRes.data || []);
      setStats({
        total: 247,
        thisMonth: 42,
        contributors: 38,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/articles?search=${searchQuery}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="hero-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Sparkles size={16} />
              <span>Knowledge Base Portal</span>
            </motion.div>

            <h1 className="hero-title">
              Discover, Share & Grow
              <br />
              <span className="text-gradient">Together</span>
            </h1>

            <p className="hero-description">
              Your central hub for team knowledge. Search through curated
              articles, best practices, and solutions shared by your colleagues.
            </p>

            <form onSubmit={handleSearch} className="hero-search">
              <div className="search-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, authors..."
                  className="search-input"
                />
                <Button type="submit" variant="primary" icon={ArrowRight}>
                  Search
                </Button>
              </div>
            </form>

            <div className="hero-stats">
              {[
                { icon: BookOpen, label: "Articles", value: stats.total },
                {
                  icon: TrendingUp,
                  label: "This Month",
                  value: stats.thisMonth,
                },
                {
                  icon: Users,
                  label: "Contributors",
                  value: stats.contributors,
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="stat-icon">
                      <Icon size={20} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="articles-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Featured Articles</h2>
            <Button variant="outline" onClick={() => navigate("/articles")}>
              View All
            </Button>
          </motion.div>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map((article, index) => (
                <Card
                  key={article.id}
                  delay={index * 0.1}
                  hover
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  <div className="article-card">
                    <div className="article-header">
                      <span className="article-category">
                        {article.category}
                      </span>
                      <div className="article-meta">
                        <Clock size={14} />
                        <span>
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">
                      {article.excerpt ||
                        (article.content?.replace(/<[^>]*>/g, '').substring(0, 120) + "...")}
                    </p>

                    <div className="article-footer">
                      <div className="author-info">
                        <div className="author-avatar">
                          {article.author?.charAt(0).toUpperCase()}
                        </div>
                        <span className="author-name">{article.author}</span>
                      </div>
                      <button className="read-more">
                        Read More
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Hidden for Admins */}
      {!isAdmin && (
        <section className="cta-section">
          <div className="container">
            <Card glow className="cta-card">
              <motion.div
                className="cta-content"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="cta-title">Have knowledge to share?</h2>
                <p className="cta-description">
                  Contribute to our growing knowledge base and help your teammates
                  learn from your experience.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/submit")}
                  icon={ArrowRight}
                >
                  Submit an Article
                </Button>
              </motion.div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
