// filepath: /c:/Users/HP/Desktop/Files/EPS/client/src/pages/Instructor.jsx
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { Routes, Route } from "react-router-dom";
import InstructorSide from "../components/InstructorSide";
import InstructorDashboard from "./InstructorDashboard";

function Instructor() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          email: decoded.email,
          userId: decoded.userId,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <InstructorSide user={user} />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<InstructorDashboard user={user} />} />
          <Route path="/my-courses" element={<div>My Courses Content Here</div>} />
          <Route path="/students" element={<div>Students Content Here</div>} />
          <Route path="/payout" element={<div>Payout Content Here</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default Instructor;