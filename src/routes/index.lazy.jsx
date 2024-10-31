import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import Dashboard from '/src/pages/Dashboard';
import Navbar from '../components/Fragments/Navbar';

export const Route = createLazyFileRoute("/")({
  component: Index,
});


function Index() {
  return (
    <div className="Index ">
<     div className="flex justify-center">
        <Navbar />
      </div>
      <Dashboard />
    </div>
  );
}

