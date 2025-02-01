import { useState } from "react";
import { Home, BookOpen, Users, DollarSign, Search } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card"; 
import { Button } from "../components/ui/Button"; 


const courses = [
  {
    id: 42454,
    title: "Tips & Trick UI Design",
    category: "UI Design",
    description:
      "Perfecting your UX/UI design skills is key to creating products or services that your users will love.",
    sell: 2424,
    earnings: "$12,353.00",
    views: 5632,
  },
  {
    id: 3156,
    title: "Become Advance Prototyping",
    category: "Prototyping",
    description:
      "Prototype is a simulation of a product that can be tested to prospective users or clients.",
    sell: 754,
    earnings: "$5,252.52",
    views: 2863,
  },
  {
    id: 5875,
    title: "Best Practices for UX Design",
    category: "UX Design",
    description:
      "Designing for big companies can be tough, but it offers great chances for UX designers.",
    sell: 564,
    earnings: "$5,252.52",
    views: 1946,
  },
];

export default function MyCourses() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 border-r">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full" />
          <div>
            <h2 className="font-semibold">Fakhri Naufal</h2>
            <p className="text-sm text-gray-500">naufal@gmail.com</p>
          </div>
        </div>
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <nav className="mt-6 space-y-2">
          <Button variant="ghost" className="w-full flex items-center space-x-2">
            <Home size={18} /> <span>Dashboard</span>
          </Button>
          <Button variant="ghost" className="w-full flex items-center space-x-2 bg-purple-100">
            <BookOpen size={18} /> <span>My Courses</span>
          </Button>
          <Button variant="ghost" className="w-full flex items-center space-x-2">
            <Users size={18} /> <span>Students</span>
          </Button>
          <Button variant="ghost" className="w-full flex items-center space-x-2">
            <DollarSign size={18} /> <span>Payout</span>
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-lg text-center">
          <h1 className="text-lg font-semibold">Become a Top Instructor!</h1>
          <p>Your performance is good, keep it up so you can become a top instructor!</p>
        </div>

        {/* Course List */}
        <div className="mt-6">
          {courses.map((course) => (
            <Card key={course.id} className="mb-4 p-4">
              <CardContent>
                <h2 className="text-lg font-semibold">#{course.id} - {course.title}</h2>
                <span className="text-xs bg-gray-200 py-1 px-2 rounded-md">{course.category}</span>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <div className="mt-4 flex space-x-4 text-sm">
                  <span className="bg-gray-100 p-2 rounded">Course Sell: {course.sell}</span>
                  <span className="bg-gray-100 p-2 rounded">Total Earning: {course.earnings}</span>
                  <span className="bg-gray-100 p-2 rounded">Course Views: {course.views}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
