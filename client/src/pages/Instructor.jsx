import React from "react";
import { Routes, Route } from "react-router-dom";
import InstructorSide from "../components/InstructorSide";
import InstructorDashboard from "./InstructorDashboard";
import Students from "../components/GroupStudents/GroupStudents";

function Instructor({ user }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <InstructorSide user={user} />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
        <Route path="" element={<InstructorDashboard user={user} />} />
          <Route path="my-courses" element={<div>My Courses Content Here</div>} />
          <Route path="students" element={<Students />} />
          <Route path="payout" element={<div>Payout Content Here</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default Instructor;