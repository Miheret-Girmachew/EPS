// import React from "react";
// import LoginPage from "./pages/LoginPage.jsx";
// import Header from "./components/Header/Header.jsx";
// import Footer from "./components/Footer/Footer.jsx";
// import NotFound from "./components/notFound/NotFound";
// function App() {
//   return (
//     <>
//       <Header />
//       <LoginPage />
//       <Footer />
// 	  {/* <NotFound/> */}
//     </>
//   );
// }

// export default App;


import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Dashboard from './pages/Dashboard';
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import NotFound from "./components/notFound/NotFound";

function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
           <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
       </main>
        <Footer />
    </>
  );
}

export default App;



// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import AdminDashboard from './pages/AdminDashboard';
// import InstructorDashboard from './pages/InstructorDashboard';
// import StudentDashboard from './pages/StudentDashboard';
// import Dashboard from './pages/Dashboard';
// import Header from "./components/Header/Header.jsx";
// import Footer from "./components/Footer/Footer.jsx";
// import NotFound from "./components/notFound/NotFound";

// function App() {
//   return (
//     <Router>
//         <Header />
//       <div className="min-h-screen">
//         <Routes>
//           <Route path="/home" element={<LoginPage />} />
//           <Route path="/admin" element={<AdminDashboard />} />
//           <Route path="/instructor" element={<InstructorDashboard />} />
//           <Route path="/student" element={<StudentDashboard />} />
//            <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>
//         <Footer />
//     </Router>
//   );
// }

// export default App;