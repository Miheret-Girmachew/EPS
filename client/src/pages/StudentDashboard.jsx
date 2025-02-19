import React, { useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import evangadiMan from "../assets/evangadiMan.jpg";
import evangadiGirl from "../assets/evangadiGirl.jpg";
import evangadiBoy from "../assets/evangadiBoy.jpg";
import logo from "../assets/evangadi-logo.png";
import { useNavigate } from "react-router-dom";
import SubmitProjectPopUp from "../components/SubmitProjectPopUp";

const images = [
    { src: evangadiMan, alt: "Mentor", title: "Learn, Grow, and Shine!", description: "Every challenge you face is an opportunity to grow. Keep learning, keep improving, and success will follow." },
    { src: evangadiGirl, alt: "Mentor", title: "Your Effort Today, Your Success Tomorrow", description: "Hard work and dedication always pay off. Stay consistent, stay focused, and achieve your dreams." },
    { src: evangadiBoy, alt: "Mentor", title: "Together, We Build the Future!", description: "Collaboration and innovation pave the way to greatness. Support others, learn from peers, and rise together." }
];

const StudentDashboard = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const handleSlideChange = (swiper) => {
    setCurrentImageIndex(swiper.realIndex);
  };
  const [showSubmitProjectPopUp, setShowSubmitProjectPopUp] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true }); // Use replace:true for logout
  };

  const handleShowSubmitProjectPopUp = () => {
    setShowSubmitProjectPopUp(true);
  };

  const handleHideSubmitProjectPopUp = useCallback(() => {
    setShowSubmitProjectPopUp(false);
  }, []);

  const handleViewSubmitedProjects = () => {
    navigate("/submitted-projects");
  };

  return (
    <div
      className="bg-cover bg-center text-white  overflow-hidden"
      style={{ backgroundImage: `url(${images[currentImageIndex].src})` }}
    >
      <header className="flex justify-between items-center p-6 bg-opacity-60">
        <div className="navbar-brand">
          <img src={logo} alt="Evangadi Logo" />
        </div>
        <button
          onClick={handleLogout}
          className="relative border px-4 py-2 text-[#ff8500] before:content-[''] before:absolute before:bottom-0 before:left-0 before:border-b-[5px] before:border-b-[#ff8500] before:border-l-[5px] before:border-l-transparent before:w-[0.8rem] before:h-[0.6rem] before:rounded-br-[50%] before:translate-y-[1.5px] after:content-[''] after:absolute after:bottom-0 after:right-0 after:border-b-[5px] after:border-b-[#ff8500] after:border-r-[5px] after:border-r-transparent after:w-[0.8rem] after:h-[0.6rem] after:rounded-bl-[50%] after:translate-y-[1.5px] "
        >
          Log Out
        </button>
      </header>

      <section className="text-center p-12 bg-opacity-40">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-[40rem] sm:h-[45rem] md:h-[50rem]"
          onSlideChange={(swiper) => handleSlideChange(swiper)}
        >
          {images.map((image, index) => (
            <SwiperSlide
              key={index}
              className="w-full h-full bg-cover bg-center"
            >
              <div className="w-full h-full flex flex-col justify-center items-center bg-opacity-40  p-12">
                <h2 className="text-5xl font-bold text-[#ff8500]">{image.title}</h2>
                <p className="mt-4 text-[#ff8500] font-[800]">{image.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="bg-black text-white p-12">
        <h3 className="text-3xl font-bold text-center mb-10 text-[#ff8500] ">
          Showcase Your Work, Track Your Progress!
        </h3>
        <div className="flex justify-around">
          <div className="relative group w-1/3">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff7e5f] via-[#feb47b] to-[#ff7e5f] rounded-xl blur transition duration-300 group-hover:blur-md"></div>
            <button
              onClick={handleShowSubmitProjectPopUp}
              className="relative flex items-center justify-center w-full p-6 bg-gray-800 rounded-xl shadow-md text-white font-semibold transform transition duration-300 ease-in-out hover:scale-105"
            >
              Submit Project
            </button>
          </div>
          <div className="relative group w-1/3">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff7e5f] via-[#feb47b] to-[#ff7e5f] rounded-xl blur transition duration-300 group-hover:blur-md"></div>
            <button
              onClick={handleViewSubmitedProjects}
              className="relative flex items-center justify-center w-full p-6 bg-gray-800 rounded-xl shadow-md text-white font-semibold transform transition duration-300 ease-in-out hover:scale-105"
            >
              View Submitted Projects
            </button>
          </div>
        </div>
      </section>
      {showSubmitProjectPopUp && (
        <SubmitProjectPopUp setShowSubmitProjectPopUp={handleHideSubmitProjectPopUp} />
      )}
    </div>
  );
};

export default StudentDashboard;