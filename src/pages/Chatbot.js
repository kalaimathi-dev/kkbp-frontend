import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  Search,
  Send,
  BookOpen,
  Folder,
  Eye,
  PenTool,
  Tag,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import "./Chatbot.css";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hi! I'm your Knowledge Assistant. Ask me about any technical issue or solution in our knowledge base.",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chatbot/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { type: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chatbot/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await response.json();
      const botMessage = {
        type: "bot",
        content: response.ok
          ? data
          : { found: false, message: data.message || "Error searching knowledge base" },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Search error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: { found: false, message: "Connection error. Please try again." },
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatSolution = (text) =>
    text
      .replace(/\n/g, "<br/>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, "<code>$1</code>");

  const truncateContent = (content) =>
    content.length > 500 ? content.substring(0, 500) : content;

  const handleExampleClick = (question) => {
    setQuery(question);
    inputRef.current?.focus();
  };

  const exampleQuestions = [
    "How to fix API timeout issue?",
    "Database connection refused error",
    "Nginx 502 bad gateway solution",
    "React component not rendering",
    "MongoDB authentication failed",
  ];

  /* ------ Bot Response Renderer ------ */
  const BotResponse = ({ data }) => {
    if (!data.found) {
      return (
        <div className="cb-response cb-response--empty">
          <AlertCircle size={20} />
          <pre>{data.message}</pre>
        </div>
      );
    }

    const article = data.article;
    return (
      <div className="cb-response cb-response--found">
        {/* Header */}
        <div className="cb-res-header">
          <div className="cb-res-check">
            <Sparkles size={16} />
          </div>
          <span>Solution Found</span>
        </div>

        {/* Title & Category */}
        <h4 className="cb-res-title">{article.title}</h4>
        <span className="cb-res-category">
          <Folder size={13} /> {article.category}
        </span>

        {/* Excerpt */}
        {article.excerpt && (
          <div className="cb-res-section">
            <h5>Summary</h5>
            <p>{article.excerpt}</p>
          </div>
        )}

        {/* Content */}
        <div className="cb-res-section">
          <h5>Solution</h5>
          <div
            className="cb-res-text"
            dangerouslySetInnerHTML={{
              __html: formatSolution(truncateContent(article.content)),
            }}
          />
          {article.content.length > 500 && (
            <p className="cb-res-truncated">Content truncated — view full article below</p>
          )}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="cb-res-tags">
            {article.tags.map((tag, idx) => (
              <span key={idx} className="cb-tag">
                <Tag size={11} /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="cb-res-footer">
          <span><Eye size={13} /> {article.views} views</span>
          <span><PenTool size={13} /> {article.author}</span>
        </div>

        {/* CTA */}
        <Link to={`/articles/${article.id}`} className="cb-res-cta">
          View Full Article <ExternalLink size={14} />
        </Link>

        {/* Alternatives */}
        {data.alternativeResults?.length > 0 && (
          <div className="cb-res-alts">
            <h5>Related Articles</h5>
            {data.alternativeResults.map((alt, idx) => (
              <Link key={idx} to={`/articles/${alt.id}`} className="cb-alt">
                <span className="cb-alt-title">{alt.title}</span>
                <span className="cb-alt-cat">{alt.category}</span>
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ------ Render ------ */
  return (
    <div className="cb">
      {/* Header */}
      <header className="cb-header">
        <div className="cb-header-inner">
          <div className="cb-header-left">
            <div className="cb-header-icon">
              <Bot size={24} />
            </div>
            <div>
              <h1>Knowledge Assistant</h1>
              <p>Search our knowledge base using natural language</p>
            </div>
          </div>
          {stats && (
            <div className="cb-header-stats">
              <div className="cb-header-stat">
                <BookOpen size={15} />
                <span>{stats.totalApprovedArticles} articles</span>
              </div>
              <div className="cb-header-stat">
                <Folder size={15} />
                <span>{stats.categoriesAvailable} categories</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="cb-messages">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              className={`cb-msg ${msg.type === "user" ? "cb-msg--user" : "cb-msg--bot"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`cb-msg-avatar ${msg.type === "user" ? "cb-avatar--user" : "cb-avatar--bot"}`}>
                {msg.type === "bot" ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="cb-msg-body">
                {msg.type === "user" ? (
                  <div className="cb-bubble cb-bubble--user">
                    <p>{msg.content}</p>
                  </div>
                ) : typeof msg.content === "string" ? (
                  <div className="cb-bubble cb-bubble--bot">
                    <p>{msg.content}</p>
                  </div>
                ) : (
                  <BotResponse data={msg.content} />
                )}
                <span className="cb-msg-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div
            className="cb-msg cb-msg--bot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="cb-msg-avatar cb-avatar--bot">
              <Bot size={18} />
            </div>
            <div className="cb-msg-body">
              <div className="cb-typing">
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Questions */}
      <AnimatePresence>
        {messages.length === 1 && (
          <motion.div
            className="cb-examples"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4>
              <MessageCircle size={15} /> Try asking
            </h4>
            <div className="cb-chips">
              {exampleQuestions.map((q, idx) => (
                <button key={idx} className="cb-chip" onClick={() => handleExampleClick(q)}>
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form className="cb-input" onSubmit={handleSearch}>
        <div className="cb-input-wrap">
          <Search size={18} className="cb-input-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything about our knowledge base..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()}>
            {loading ? <Loader2 size={18} className="cb-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
