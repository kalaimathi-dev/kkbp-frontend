import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./Articles.css";

const Articles = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "APPROVED");

      if (searchParams.get("search")) {
        params.append("search", searchParams.get("search"));
      }

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      const response = await api.get(`/articles?${params.toString()}`);
      let data = response.data || [];

      // Sort articles
      if (sortBy === "newest") {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === "oldest") {
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortBy === "popular") {
        data.sort((a, b) => (b.views || 0) - (a.views || 0));
      }

      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set("search", searchQuery);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("newest");
    setSearchParams({});
  };

  const activeFiltersCount =
    (searchParams.get("search") ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  return (
    <div className="articles-page">
      <div className="container">
        {/* Page Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <h1 className="page-title">Knowledge Base</h1>
            <p className="page-description">
              Explore {articles.length} articles from your team
            </p>
          </div>

          {!isAdmin && (
            <Button variant="primary" onClick={() => navigate("/submit")}>
              Submit Article
            </Button>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="search-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSearch} className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                }}
                className="clear-search"
              >
                <X size={16} />
              </button>
            )}
          </form>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={showFilters ? X : SlidersHorizontal}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filters-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="filters-content">
                  {/* Categories */}
                  <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <div className="category-pills">
                      <button
                        className={`category-pill ${!selectedCategory ? "active" : ""}`}
                        onClick={() => setSelectedCategory("")}
                      >
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={`category-pill ${selectedCategory === category.name ? "active" : ""}`}
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="filter-group">
                    <label className="filter-label">Sort By</label>
                    <div className="sort-options">
                      {[
                        { value: "newest", label: "Newest First" },
                        { value: "oldest", label: "Oldest First" },
                        { value: "popular", label: "Most Popular" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={`sort-option ${sortBy === option.value ? "active" : ""}`}
                          onClick={() => setSortBy(option.value)}
                        >
                          <ArrowUpDown size={16} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" onClick={clearFilters} size="sm">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Articles Grid */}
        {loading ? (
          <div className="articles-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <div className="empty-content">
                <div className="empty-icon">📚</div>
                <h3>No articles found</h3>
                <p>Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="articles-grid">
            {articles.map((article, index) => (
              <Card
                key={article.id}
                delay={index * 0.05}
                hover
                onClick={() => navigate(`/articles/${article.id}`)}
              >
                <div className="article-card">
                  <div className="article-header">
                    <span className="article-category">{article.category}</span>
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
                      (article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + "...")}
                  </p>

                  <div className="article-footer">
                    <div className="author-info">
                      <div className="author-avatar">
                        {article.author?.charAt(0).toUpperCase()}
                      </div>
                      <span className="author-name">{article.author}</span>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="article-tags">
                        {article.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
