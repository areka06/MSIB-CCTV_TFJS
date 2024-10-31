import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import DynamicCCTVCounter from '/src/pages/DynamicCCTVCounter';
import CountTest from "/src/components/Fragments/CountTest"
import CCTVTest from '/src/pages/CCTVTest';
import Navbar from '../components/Fragments/Navbar';

function Test() {
  return (
    <div className="Test">
      <div className="flex justify-center">
        <Navbar />
      </div>
      {/* <CountTest /> */}
      <CCTVTest/>
    </div>
  );
}

export const Route = createLazyFileRoute("/test")({
    component: Test,
  });

