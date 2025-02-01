import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Dashboard from './pages/Dashboard';
import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import NotFound from './components/notFound/NotFound';
import SubmittedProjects from './pages/SubmittedProjects.jsx';
import { jwtDecode } from 'jwt-decode';

// Authentication Route component
const AuthRoute = ({ children, isAuthenticated, redirectTo }) => {
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
};

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // track authentication

  // Check if user is logged in on page load or when the token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        //If token is valid
        jwtDecode(token);
        setIsAuthenticated(true);
      } catch (error) {
        //If token is not valid
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else {
       setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    // Redirect the authenticated users when they try to access login
      if (isAuthenticated && isLoginPage) {
      const token = localStorage.getItem('token');
      const decodedToken = token ? jwtDecode(token) : null;
      const role = decodedToken?.role;

       if (role === 1) {
        navigate('/admin');
       } else if (role === 2) {
         navigate('/instructor');
      } else if (role === 3) {
          navigate('/student');
      }
    }
  }, [isAuthenticated, isLoginPage, navigate]);


  return (
    <>
      {!isAuthenticated && isLoginPage && <Header />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
           <Route
            path="/admin"
            element={
              <AuthRoute
                isAuthenticated={isAuthenticated}
                redirectTo="/"
              >
                <AdminDashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <AuthRoute
                isAuthenticated={isAuthenticated}
                redirectTo="/"
              >
                <InstructorDashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/student"
            element={
              <AuthRoute
                isAuthenticated={isAuthenticated}
                redirectTo="/"
              >
                <StudentDashboard />
              </AuthRoute>
            }
          />
           <Route
            path="/submitted-projects"
            element={
              <AuthRoute
                isAuthenticated={isAuthenticated}
                redirectTo="/"
              >
                <SubmittedProjects />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthRoute
                isAuthenticated={isAuthenticated}
                redirectTo="/"
              >
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthenticated && isLoginPage && <Footer />}
    </>
  );
}

export default App;