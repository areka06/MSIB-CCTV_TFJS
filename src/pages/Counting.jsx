import React from "react";
import Navbar from "../components/Fragments/Navbar";
import Hero from "../components/Fragments/Hero";
import CountingSection from "../../temp/CountingSection";
import VideoPlayer from "../components/Elements/Video";
import { Link } from '@tanstack/react-router';

const Counting = () => {
  return (
    <div className="bg-customRed">
      <div className="flex justify-center">
        <Navbar />
        <Hero />
      </div>
      <div>
        <CountingSection/>
        <Link to="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
};

export default Counting;
