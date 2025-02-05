// InstructorSide.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, DollarSign } from "lucide-react";
import { Button } from "./ui/Button";

const InstructorSide = ({ user }) => {
  const location = useLocation();

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
          <Button
            key={path}
            as={Link}
            to={path}
            variant="ghost"
            className={`w-full flex items-center space-x-2 ${
              location.pathname === path ? "bg-purple-100" : ""
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default InstructorSide;