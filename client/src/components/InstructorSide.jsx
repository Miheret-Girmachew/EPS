import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Users, DollarSign } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const InstructorSide = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === "/") {
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;
      const role = decodedToken?.role;

      if (role === 1) {
        navigate("/admin");
      } else if (role === 2) {
        navigate("/instructor");
      } else if (role === 3) {
        navigate("/student");
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  console.log("Current location:", location.pathname); // Debugging log

  return (
    <aside className="w-64 bg-white p-4 border-r">
      <div className="flex items-center space-x-3">
        <div>
          <h2 className="font-semibold">
            {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
          </h2>
          <p className="text-sm text-gray-500">{user ? user.email : "Loading..."}</p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {[
          { path: "/instructor", label: "Dashboard", Icon: Home },
          { path: "/instructor/my-courses", label: "My Courses", Icon: BookOpen },
          { path: "/instructor/students", label: "Students", Icon: Users },
          { path: "/instructor/payout", label: "Payout", Icon: DollarSign },
        ].map(({ path, label, Icon }) => (
          <Link
            key={path}
            to={path}
            className={`w-full flex items-center space-x-2 p-2 rounded-md ${
              location.pathname.startsWith(path) ? "bg-purple-100" : ""
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default InstructorSide;
