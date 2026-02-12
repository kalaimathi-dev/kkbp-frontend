import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  BarChart3,
  Shield,
  Activity,
  Folder,
  Tag as TagIcon,
  Edit2,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  FileX,
  ChevronLeft,
  ChevronRight,
  Search,
  Zap,
  ArrowUpRight,
  Award,
  Globe,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "react-toastify";
import "./AdminDashboard_New.css";

/* ============================================================
   ADMIN DASHBOARD - MAIN COMPONENT
   ============================================================ */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState(null);

  // Pending approvals
  const [pendingArticles, setPendingArticles] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  // User management
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState({ search: "", role: "", status: "" });
  const [userPagination, setUserPagination] = useState({ page: 1, total: 0, pages: 0 });

  // Article management
  const [allArticles, setAllArticles] = useState([]);
  const [articleFilter, setArticleFilter] = useState({ search: "", status: "", category: "" });
  const [articlePagination, setArticlePagination] = useState({ page: 1, total: 0, pages: 0 });

  // Category & Tag management
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTag, setEditingTag] = useState(null);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState({ action: "", entity: "" });
  const [auditPagination, setAuditPagination] = useState({ page: 1, total: 0, pages: 0 });

  // Analytics
  const [analytics, setAnalytics] = useState(null);

  /* ------ Data Fetching ------ */
  useEffect(() => {
    fetchDataForTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchDataForTab = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "dashboard": await fetchDashboardStats(); break;
        case "approvals": await fetchPendingArticles(); break;
        case "users": await fetchUsers(); break;
        case "articles": await fetchAllArticles(); break;
        case "categories": await fetchCategoriesAndTags(); break;
        case "audit": await fetchAuditLogs(); break;
        case "analytics": await fetchAnalytics(); break;
        default: break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDataForTab(activeTab);
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard stats");
    }
  };

  const fetchPendingArticles = async () => {
    try {
      const response = await api.get("/articles?status=PENDING");
      setPendingArticles(response.data || []);
    } catch (error) {
      console.error("Error fetching pending articles:", error);
      toast.error("Failed to load pending articles");
    }
  };

  const handleApprove = async (articleId) => {
    setProcessingId(articleId);
    try {
      await api.patch(`/articles/${articleId}/approve`);
      toast.success("Article approved successfully!");
      await fetchPendingArticles();
      if (dashboardStats) await fetchDashboardStats();
    } catch (error) {
      console.error("Error approving article:", error);
      toast.error("Failed to approve article");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (articleId) => {
    const reason = prompt("Enter rejection reason (optional):");
    setProcessingId(articleId);
    try {
      await api.patch(`/articles/${articleId}/reject`, { reason });
      toast.success("Article rejected");
      await fetchPendingArticles();
      if (dashboardStats) await fetchDashboardStats();
    } catch (error) {
      console.error("Error rejecting article:", error);
      toast.error("Failed to reject article");
    } finally {
      setProcessingId(null);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, ...userFilter });
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users || []);
      setUserPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User ${currentStatus ? "deactivated" : "activated"} successfully`);
      await fetchUsers(userPagination.page);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleUserRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "EMPLOYEE" : "ADMIN";
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("User role updated successfully");
      await fetchUsers(userPagination.page);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      await fetchUsers(userPagination.page);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const fetchAllArticles = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, ...articleFilter });
      const response = await api.get(`/admin/articles?${params}`);
      setAllArticles(response.data.articles || []);
      setArticlePagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.delete(`/admin/articles/${articleId}`);
      toast.success("Article deleted successfully");
      await fetchAllArticles(articlePagination.page);
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleUnpublishArticle = async (articleId) => {
    if (!window.confirm("Are you sure you want to unpublish this article?")) return;
    try {
      await api.patch(`/admin/articles/${articleId}/unpublish`);
      toast.success("Article unpublished successfully");
      await fetchAllArticles(articlePagination.page);
    } catch (error) {
      console.error("Error unpublishing article:", error);
      toast.error("Failed to unpublish article");
    }
  };

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        api.get("/admin/categories"),
        api.get("/admin/tags"),
      ]);
      setCategories(categoriesRes.data || []);
      setTags(tagsRes.data || []);
    } catch (error) {
      console.error("Error fetching categories and tags:", error);
      toast.error("Failed to load categories and tags");
    }
  };

  const handleUpdateCategory = async (categoryId, data) => {
    try {
      await api.patch(`/admin/categories/${categoryId}`, data);
      toast.success("Category updated successfully");
      setEditingCategory(null);
      await fetchCategoriesAndTags();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${categoryId}`);
      toast.success("Category deleted successfully");
      await fetchCategoriesAndTags();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleUpdateTag = async (tagId, data) => {
    try {
      await api.patch(`/admin/tags/${tagId}`, data);
      toast.success("Tag updated successfully");
      setEditingTag(null);
      await fetchCategoriesAndTags();
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag");
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await api.delete(`/admin/tags/${tagId}`);
      toast.success("Tag deleted successfully");
      await fetchCategoriesAndTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const fetchAuditLogs = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 50, ...auditFilter });
      const response = await api.get(`/admin/audit-logs?${params}`);
      setAuditLogs(response.data.logs || []);
      setAuditPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/admin/analytics?period=30");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    }
  };

  /* ------ Helpers ------ */
  const getStatusBadge = (status) => {
    const map = {
      PENDING:  { cls: "pending",  icon: Clock,       label: "Pending" },
      APPROVED: { cls: "approved", icon: CheckCircle, label: "Approved" },
      REJECTED: { cls: "rejected", icon: XCircle,     label: "Rejected" },
      DRAFT:    { cls: "draft",    icon: FileText,    label: "Draft" },
    };
    const c = map[status] || map.DRAFT;
    const Icon = c.icon;
    return (
      <span className={`ad-badge ad-badge--${c.cls}`}>
        <Icon size={13} /> {c.label}
      </span>
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  /* ------ Tabs Config ------ */
  const tabs = [
    { id: "dashboard",  label: "Dashboard",         icon: LayoutDashboard },
    { id: "approvals",  label: "Pending Approvals",  icon: Clock,    badge: pendingArticles.length },
    { id: "articles",   label: "Article Management", icon: FileText },
    { id: "users",      label: "User Management",    icon: Users },
    { id: "categories", label: "Categories & Tags",  icon: Folder },
    { id: "audit",      label: "Audit Logs",         icon: Activity },
    { id: "analytics",  label: "Analytics",          icon: BarChart3 },
  ];

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="ad">
      {/* -------- Sidebar -------- */}
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <div className="ad-brand-icon"><Shield size={20} /></div>
          <div>
            <div className="ad-brand-name">Kambaa KB</div>
            <div className="ad-brand-sub">Admin Console</div>
          </div>
        </div>

        <nav className="ad-nav">
          <span className="ad-nav-label">NAVIGATION</span>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`ad-nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ad-nav-icon"><Icon size={18} /></span>
                <span className="ad-nav-text">{tab.label}</span>
                {tab.badge > 0 && <span className="ad-nav-badge">{tab.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="ad-sidebar-bottom">
          <button className="ad-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </aside>

      {/* -------- Main -------- */}
      <main className="ad-main">
        <header className="ad-topbar">
          <div>
            <h1 className="ad-topbar-title">{tabs.find((t) => t.id === activeTab)?.label}</h1>
            <span className="ad-topbar-crumb">
              Admin &rsaquo; {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>
          <button className="ad-topbar-refresh" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
          </button>
        </header>

        <section className="ad-body">
          {loading && !refreshing ? (
            <div className="ad-loader">
              <div className="ad-loader-spinner" />
              <p>Loading data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && dashboardStats && (
                <DashboardTab key="dash" stats={dashboardStats} formatDate={formatDate} />
              )}
              {activeTab === "approvals" && (
                <ApprovalsTab
                  key="appr"
                  articles={pendingArticles}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  processingId={processingId}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              )}
              {activeTab === "articles" && (
                <ArticleManagementTab
                  key="arts"
                  articles={allArticles}
                  pagination={articlePagination}
                  filter={articleFilter}
                  setFilter={setArticleFilter}
                  fetchArticles={fetchAllArticles}
                  handleDelete={handleDeleteArticle}
                  handleUnpublish={handleUnpublishArticle}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              )}
              {activeTab === "users" && (
                <UserManagementTab
                  key="usrs"
                  users={users}
                  pagination={userPagination}
                  filter={userFilter}
                  setFilter={setUserFilter}
                  fetchUsers={fetchUsers}
                  handleStatusToggle={handleUserStatusToggle}
                  handleRoleChange={handleUserRoleChange}
                  handleDelete={handleDeleteUser}
                  formatDate={formatDate}
                />
              )}
              {activeTab === "categories" && (
                <CategoriesTagsTab
                  key="cats"
                  categories={categories}
                  tags={tags}
                  editingCategory={editingCategory}
                  setEditingCategory={setEditingCategory}
                  editingTag={editingTag}
                  setEditingTag={setEditingTag}
                  handleUpdateCategory={handleUpdateCategory}
                  handleDeleteCategory={handleDeleteCategory}
                  handleUpdateTag={handleUpdateTag}
                  handleDeleteTag={handleDeleteTag}
                />
              )}
              {activeTab === "audit" && (
                <AuditLogsTab
                  key="logs"
                  logs={auditLogs}
                  pagination={auditPagination}
                  filter={auditFilter}
                  setFilter={setAuditFilter}
                  fetchLogs={fetchAuditLogs}
                  formatDate={formatDate}
                />
              )}
              {activeTab === "analytics" && analytics && (
                <AnalyticsTab key="anlyt" analytics={analytics} />
              )}
            </AnimatePresence>
          )}
        </section>
      </main>
    </div>
  );
};

/* ============================================================
   ANIMATION WRAPPER
   ============================================================ */
const pageAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.25 },
};

/* ============================================================
   DASHBOARD TAB
   ============================================================ */
const DashboardTab = ({ stats, formatDate }) => (
  <motion.div {...pageAnim} className="ad-tab">
    {/* Welcome */}
    <div className="ad-welcome">
      <div className="ad-welcome-text">
        <h2>Welcome back, Admin</h2>
        <p>Here&rsquo;s what&rsquo;s happening with your knowledge base today.</p>
      </div>
      <div className="ad-welcome-icon"><Zap size={32} /></div>
    </div>

    {/* Stats Grid */}
    <div className="ad-stats-grid">
      <StatCard
        icon={Users} color="blue"
        value={stats.users.total} label="Total Users"
        sub={`${stats.users.active} active`}
      />
      <StatCard
        icon={FileText} color="emerald"
        value={stats.articles.total} label="Total Articles"
        sub={`${stats.articles.approved} published`}
      />
      <StatCard
        icon={Clock} color="amber"
        value={stats.articles.pending} label="Pending Review"
        sub="Awaiting approval"
      />
      <StatCard
        icon={XCircle} color="rose"
        value={stats.articles.rejected} label="Rejected"
        sub="Not published"
      />
    </div>

    {/* Quick Counts */}
    <div className="ad-quick-row">
      <div className="ad-quick-card">
        <Folder size={20} />
        <div>
          <strong>{stats.categories}</strong>
          <span>Categories</span>
        </div>
      </div>
      <div className="ad-quick-card">
        <TagIcon size={20} />
        <div>
          <strong>{stats.tags}</strong>
          <span>Tags</span>
        </div>
      </div>
      <div className="ad-quick-card">
        <Globe size={20} />
        <div>
          <strong>{stats.articles.total}</strong>
          <span>Total Views</span>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="ad-card">
      <div className="ad-card-head">
        <Activity size={18} />
        <h3>Recent Activity</h3>
      </div>
      <div className="ad-activity-list">
        {stats.recentActivity.length === 0 && (
          <p className="ad-empty-text">No recent activity</p>
        )}
        {stats.recentActivity.slice(0, 10).map((log) => (
          <div key={log._id} className="ad-activity-row">
            <div className={`ad-activity-dot ${getActionColor(log.action)}`} />
            <div className="ad-activity-body">
              <p>
                <strong>{log.user?.username || "System"}</strong>{" "}
                {getActivityText(log.action)}
              </p>
              <span>{formatDate(log.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

/* Reusable Stat Card */
const StatCard = ({ icon: Icon, color, value, label, sub }) => (
  <div className={`ad-stat ad-stat--${color}`}>
    <div className="ad-stat-icon">
      <Icon size={22} />
    </div>
    <div className="ad-stat-data">
      <h3>{value}</h3>
      <p>{label}</p>
      <span>{sub}</span>
    </div>
    <ArrowUpRight size={16} className="ad-stat-arrow" />
  </div>
);

/* ============================================================
   APPROVALS TAB
   ============================================================ */
const ApprovalsTab = ({ articles, handleApprove, handleReject, processingId, formatDate, getStatusBadge }) => (
  <motion.div {...pageAnim} className="ad-tab">
    {articles.length === 0 ? (
      <div className="ad-empty">
        <CheckCircle size={48} />
        <h3>All caught up!</h3>
        <p>No pending articles to review.</p>
      </div>
    ) : (
      <>
        <div className="ad-section-bar">
          <span className="ad-section-count">{articles.length} articles pending review</span>
        </div>
        <div className="ad-grid-3">
          {articles.map((article) => (
            <div key={article.id} className="ad-article-card">
              <div className="ad-article-top">
                <span className="ad-category-pill">
                  {article.category?.name || "Uncategorized"}
                </span>
                <span className="ad-date-text">
                  <Calendar size={13} /> {formatDate(article.createdAt)}
                </span>
              </div>
              <h4 className="ad-article-title">{article.title}</h4>
              <p className="ad-article-excerpt">
                {article.excerpt || (article.content?.replace(/<[^>]*>/g, '').substring(0, 140) + "...") || "No content"}
              </p>
              <div className="ad-article-meta">
                {getStatusBadge(article.status)}
                <span className="ad-views"><Eye size={13} /> {article.views || 0}</span>
              </div>
              <div className="ad-article-bottom">
                <div className="ad-author">
                  <div className="ad-avatar">{article.author?.username?.charAt(0).toUpperCase()}</div>
                  <span>{article.author?.username}</span>
                </div>
                <div className="ad-actions-row">
                  <button
                    className="ad-btn ad-btn--approve"
                    onClick={() => handleApprove(article.id)}
                    disabled={processingId === article.id}
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    className="ad-btn ad-btn--reject"
                    onClick={() => handleReject(article.id)}
                    disabled={processingId === article.id}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
              {article.tags?.length > 0 && (
                <div className="ad-tag-row">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="ad-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </motion.div>
);

/* ============================================================
   ARTICLE MANAGEMENT TAB
   ============================================================ */
const ArticleManagementTab = ({
  articles, pagination, filter, setFilter,
  fetchArticles, handleDelete, handleUnpublish, formatDate, getStatusBadge,
}) => (
  <motion.div {...pageAnim} className="ad-tab">
    {/* Filters */}
    <div className="ad-filter-bar">
      <div className="ad-search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search articles..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>
      <select
        value={filter.status}
        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        className="ad-select"
      >
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
      <button className="ad-btn ad-btn--primary" onClick={() => fetchArticles(1)}>
        Apply
      </button>
    </div>

    {/* Grid */}
    <div className="ad-grid-3">
      {articles.map((article) => (
        <div key={article.id} className="ad-article-card">
          <div className="ad-article-top">
            <span className="ad-category-pill">
              {article.category?.name || "Uncategorized"}
            </span>
            <span className="ad-date-text">
              <Calendar size={13} /> {formatDate(article.createdAt)}
            </span>
          </div>
          <h4 className="ad-article-title">{article.title}</h4>
          <p className="ad-article-excerpt">
            {(article.excerpt?.replace(/<[^>]*>/g, '').substring(0, 120)) || "No excerpt"}...
          </p>
          <div className="ad-article-meta">
            {getStatusBadge(article.status)}
            <span className="ad-views"><Eye size={13} /> {article.views || 0}</span>
          </div>
          <div className="ad-article-bottom">
            <div className="ad-author">
              <div className="ad-avatar">{article.author?.username?.charAt(0).toUpperCase()}</div>
              <span>{article.author?.username}</span>
            </div>
            <div className="ad-actions-row">
              {article.status === "APPROVED" && (
                <button className="ad-icon-btn ad-icon-btn--amber" onClick={() => handleUnpublish(article.id)} title="Unpublish">
                  <FileX size={16} />
                </button>
              )}
              <button className="ad-icon-btn ad-icon-btn--red" onClick={() => handleDelete(article.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {article.tags?.length > 0 && (
            <div className="ad-tag-row">
              {article.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="ad-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Pagination */}
    {pagination.pages > 1 && (
      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        onPrev={() => fetchArticles(pagination.page - 1)}
        onNext={() => fetchArticles(pagination.page + 1)}
      />
    )}
  </motion.div>
);

/* ============================================================
   USER MANAGEMENT TAB
   ============================================================ */
const UserManagementTab = ({
  users, pagination, filter, setFilter,
  fetchUsers, handleStatusToggle, handleRoleChange, handleDelete, formatDate,
}) => (
  <motion.div {...pageAnim} className="ad-tab">
    {/* Filters */}
    <div className="ad-filter-bar">
      <div className="ad-search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search users..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>
      <select
        value={filter.role}
        onChange={(e) => setFilter({ ...filter, role: e.target.value })}
        className="ad-select"
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="EMPLOYEE">Employee</option>
      </select>
      <select
        value={filter.status}
        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        className="ad-select"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button className="ad-btn ad-btn--primary" onClick={() => fetchUsers(1)}>
        Apply
      </button>
    </div>

    {/* Users Grid */}
    <div className="ad-grid-3">
      {users.map((user) => (
        <div key={user._id} className="ad-user-card">
          <div className="ad-user-top">
            <div className="ad-user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <span className={`ad-role-pill ad-role--${user.role.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
          <h4 className="ad-user-name">{user.username}</h4>
          <p className="ad-user-email">{user.email}</p>
          <div className="ad-user-stats">
            <div className="ad-user-stat">
              <FileText size={16} />
              <strong>{user.articleCount || 0}</strong>
              <span>Articles</span>
            </div>
            <div className="ad-user-stat">
              <Activity size={16} />
              <span className={`ad-status-dot ${user.isActive ? "active" : "inactive"}`}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="ad-user-meta">
            <Calendar size={13} />
            <span>Joined {user.lastLogin ? formatDate(user.lastLogin) : "N/A"}</span>
          </div>
          <div className="ad-user-actions">
            <button
              className={`ad-icon-btn ${user.isActive ? "ad-icon-btn--amber" : "ad-icon-btn--green"}`}
              onClick={() => handleStatusToggle(user._id, user.isActive)}
              title={user.isActive ? "Deactivate" : "Activate"}
            >
              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
            </button>
            <button
              className="ad-icon-btn ad-icon-btn--blue"
              onClick={() => handleRoleChange(user._id, user.role)}
              title="Toggle Role"
            >
              <Shield size={16} />
            </button>
            <button
              className="ad-icon-btn ad-icon-btn--red"
              onClick={() => handleDelete(user._id)}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>

    {pagination.pages > 1 && (
      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        onPrev={() => fetchUsers(pagination.page - 1)}
        onNext={() => fetchUsers(pagination.page + 1)}
      />
    )}
  </motion.div>
);

/* ============================================================
   CATEGORIES & TAGS TAB
   ============================================================ */
const CategoriesTagsTab = ({
  categories, tags,
  editingCategory, setEditingCategory,
  editingTag, setEditingTag,
  handleUpdateCategory, handleDeleteCategory,
  handleUpdateTag, handleDeleteTag,
}) => (
  <motion.div {...pageAnim} className="ad-tab">
    <div className="ad-two-col">
      {/* Categories */}
      <div className="ad-card">
        <div className="ad-card-head">
          <Folder size={18} />
          <h3>Categories</h3>
          <span className="ad-count-chip">{categories.length}</span>
        </div>
        <div className="ad-list">
          {categories.map((cat) => (
            <div key={cat._id} className="ad-list-item">
              {editingCategory?._id === cat._id ? (
                <div className="ad-inline-edit">
                  <input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="ad-inline-input"
                    autoFocus
                  />
                  <button className="ad-btn ad-btn--sm ad-btn--primary" onClick={() => handleUpdateCategory(cat._id, { name: editingCategory.name })}>
                    Save
                  </button>
                  <button className="ad-btn ad-btn--sm ad-btn--ghost" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="ad-list-info">
                    <strong>{cat.name}</strong>
                    <span>{cat.articleCount || 0} articles</span>
                  </div>
                  <div className="ad-list-actions">
                    <button className="ad-icon-btn ad-icon-btn--blue" onClick={() => setEditingCategory(cat)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="ad-icon-btn ad-icon-btn--red" onClick={() => handleDeleteCategory(cat._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="ad-empty-text">No categories yet</p>}
        </div>
      </div>

      {/* Tags */}
      <div className="ad-card">
        <div className="ad-card-head">
          <TagIcon size={18} />
          <h3>Tags</h3>
          <span className="ad-count-chip">{tags.length}</span>
        </div>
        <div className="ad-list">
          {tags.map((tag) => (
            <div key={tag._id} className="ad-list-item">
              {editingTag?._id === tag._id ? (
                <div className="ad-inline-edit">
                  <input
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    className="ad-inline-input"
                    autoFocus
                  />
                  <button className="ad-btn ad-btn--sm ad-btn--primary" onClick={() => handleUpdateTag(tag._id, { name: editingTag.name })}>
                    Save
                  </button>
                  <button className="ad-btn ad-btn--sm ad-btn--ghost" onClick={() => setEditingTag(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="ad-list-info">
                    <strong>{tag.name}</strong>
                    <span>{tag.articleCount || 0} articles</span>
                  </div>
                  <div className="ad-list-actions">
                    <button className="ad-icon-btn ad-icon-btn--blue" onClick={() => setEditingTag(tag)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="ad-icon-btn ad-icon-btn--red" onClick={() => handleDeleteTag(tag._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {tags.length === 0 && <p className="ad-empty-text">No tags yet</p>}
        </div>
      </div>
    </div>
  </motion.div>
);

/* ============================================================
   AUDIT LOGS TAB
   ============================================================ */
const AuditLogsTab = ({ logs, pagination, filter, setFilter, fetchLogs, formatDate }) => (
  <motion.div {...pageAnim} className="ad-tab">
    {/* Filters */}
    <div className="ad-filter-bar">
      <select
        value={filter.action}
        onChange={(e) => setFilter({ ...filter, action: e.target.value })}
        className="ad-select"
      >
        <option value="">All Actions</option>
        <option value="ARTICLE_APPROVE">Article Approve</option>
        <option value="ARTICLE_REJECT">Article Reject</option>
        <option value="ARTICLE_DELETE">Article Delete</option>
        <option value="USER_CREATE">User Create</option>
        <option value="USER_EDIT">User Edit</option>
        <option value="USER_DELETE">User Delete</option>
      </select>
      <select
        value={filter.entity}
        onChange={(e) => setFilter({ ...filter, entity: e.target.value })}
        className="ad-select"
      >
        <option value="">All Entities</option>
        <option value="Article">Article</option>
        <option value="User">User</option>
        <option value="Category">Category</option>
        <option value="Tag">Tag</option>
      </select>
      <button className="ad-btn ad-btn--primary" onClick={() => fetchLogs(1)}>
        Apply
      </button>
    </div>

    {/* Logs Table */}
    <div className="ad-card">
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5} className="ad-table-empty">No audit logs found</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="ad-table-date">{formatDate(log.createdAt)}</td>
                <td>
                  <strong>{log.user?.username || "System"}</strong>
                  <br />
                  <small className="ad-muted">{log.user?.email}</small>
                </td>
                <td>
                  <span className={`ad-action-badge ad-action--${getActionColor(log.action)}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td>{log.entity}</td>
                <td className="ad-table-detail">{log.details || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPrev={() => fetchLogs(pagination.page - 1)}
          onNext={() => fetchLogs(pagination.page + 1)}
        />
      )}
    </div>
  </motion.div>
);

/* ============================================================
   ANALYTICS TAB
   ============================================================ */
const AnalyticsTab = ({ analytics }) => (
  <motion.div {...pageAnim} className="ad-tab">
    {/* Top Contributors */}
    <div className="ad-card">
      <div className="ad-card-head">
        <Award size={18} />
        <h3>Top Contributors (Last 30 Days)</h3>
      </div>
      <div className="ad-contributors">
        {analytics.topContributors.slice(0, 10).map((c, i) => (
          <div key={c._id} className="ad-contributor">
            <span className="ad-rank">#{i + 1}</span>
            <div className="ad-contributor-avatar">{c.username?.charAt(0).toUpperCase()}</div>
            <div className="ad-contributor-info">
              <strong>{c.username}</strong>
              <small>{c.email}</small>
            </div>
            <div className="ad-contributor-nums">
              <span>{c.articleCount} articles</span>
              <span>{c.totalViews} views</span>
            </div>
          </div>
        ))}
        {analytics.topContributors.length === 0 && (
          <p className="ad-empty-text">No contributor data available</p>
        )}
      </div>
    </div>

    {/* Charts Row */}
    <div className="ad-two-col">
      <div className="ad-card">
        <div className="ad-card-head">
          <BarChart3 size={18} />
          <h3>Articles by Status</h3>
        </div>
        <div className="ad-bar-chart">
          {analytics.articlesByStatus.map((item) => (
            <div key={item._id} className="ad-bar-row">
              <span className="ad-bar-label">{item._id}</span>
              <div className="ad-bar-track">
                <div
                  className={`ad-bar-fill ad-bar--${item._id?.toLowerCase()}`}
                  style={{ width: `${Math.min((item.count / Math.max(...analytics.articlesByStatus.map(x => x.count), 1)) * 100, 100)}%` }}
                >
                  {item.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ad-card">
        <div className="ad-card-head">
          <Folder size={18} />
          <h3>Articles by Category</h3>
        </div>
        <div className="ad-bar-chart">
          {analytics.articlesByCategory.slice(0, 6).map((item) => (
            <div key={item._id} className="ad-bar-row">
              <span className="ad-bar-label">{item._id}</span>
              <div className="ad-bar-track">
                <div
                  className="ad-bar-fill ad-bar--category"
                  style={{ width: `${Math.min((item.count / Math.max(...analytics.articlesByCategory.map(x => x.count), 1)) * 100, 100)}%` }}
                >
                  {item.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Turnaround */}
    <div className="ad-card">
      <div className="ad-card-head">
        <Clock size={18} />
        <h3>Approval Turnaround Time</h3>
      </div>
      <div className="ad-turnaround">
        <div className="ad-turn-item">
          <span className="ad-turn-label">Average</span>
          <strong className="ad-turn-value">{analytics.approvalTurnaround.avgTurnaround.toFixed(1)}h</strong>
        </div>
        <div className="ad-turn-item">
          <span className="ad-turn-label">Minimum</span>
          <strong className="ad-turn-value">{analytics.approvalTurnaround.minTurnaround.toFixed(1)}h</strong>
        </div>
        <div className="ad-turn-item">
          <span className="ad-turn-label">Maximum</span>
          <strong className="ad-turn-value">{analytics.approvalTurnaround.maxTurnaround.toFixed(1)}h</strong>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
const Pagination = ({ page, pages, onPrev, onNext }) => (
  <div className="ad-pagination">
    <button className="ad-page-btn" onClick={onPrev} disabled={page === 1}>
      <ChevronLeft size={16} /> Previous
    </button>
    <span className="ad-page-info">Page {page} of {pages}</span>
    <button className="ad-page-btn" onClick={onNext} disabled={page === pages}>
      Next <ChevronRight size={16} />
    </button>
  </div>
);

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
const getActivityText = (action) => {
  const texts = {
    ARTICLE_APPROVE: "approved an article",
    ARTICLE_REJECT: "rejected an article",
    ARTICLE_CREATE: "created an article",
    ARTICLE_DELETE: "deleted an article",
    USER_CREATE: "created a user",
    USER_EDIT: "edited a user",
    USER_DELETE: "deleted a user",
    USER_ACTIVATE: "activated a user",
    USER_DEACTIVATE: "deactivated a user",
    CATEGORY_CREATE: "created a category",
    CATEGORY_EDIT: "edited a category",
    CATEGORY_DELETE: "deleted a category",
    TAG_CREATE: "created a tag",
    TAG_EDIT: "edited a tag",
    TAG_DELETE: "deleted a tag",
    LOGIN: "logged in",
  };
  return texts[action] || action.toLowerCase().replace(/_/g, " ");
};

const getActionColor = (action) => {
  if (action.includes("APPROVE") || action.includes("CREATE") || action.includes("ACTIVATE")) return "success";
  if (action.includes("REJECT") || action.includes("DELETE") || action.includes("DEACTIVATE")) return "danger";
  if (action.includes("EDIT") || action.includes("UPDATE")) return "info";
  return "default";
};

export default AdminDashboard;
