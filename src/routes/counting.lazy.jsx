import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import Navbar from "../components/Fragments/Navbar";
import Hero from "../components/Fragments/Hero";
import CCTVTest from '/src/pages/CCTVTest';
import TestPage from "/src/pages/TestPages"


const Counting = () => {
  return (
    <div className="bg-white">
      <div className="flex justify-center">
        <Navbar />
        <Hero />
      </div>
      <div>
        <TestPage/> 
        {/* <DynamicCCTVCounter/> */}
        {/* <CCTVTest/> */}
      </div>
    </div>
  );
};

export const Route = createLazyFileRoute("/counting")({
  component: Counting,
});
