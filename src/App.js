import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import SubmitArticle from "./pages/SubmitArticle";
import MyArticles from "./pages/MyArticles";
import AdminDashboard from "./pages/AdminDashboard_New";
import Profile from "./pages/Profile";
import Chatbot from "./pages/Chatbot";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user, isAdmin } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : isAdmin ? <Navigate to="/admin" /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : isAdmin ? <Navigate to="/admin" /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              {isAdmin ? <Navigate to="/admin" replace /> : <Home />}
            </PrivateRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <PrivateRoute>
              <Articles />
            </PrivateRoute>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <PrivateRoute>
              <ArticleDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <PrivateRoute>
              <SubmitArticle />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-articles"
          element={
            <PrivateRoute>
              <MyArticles />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <PrivateRoute>
              <Chatbot />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
