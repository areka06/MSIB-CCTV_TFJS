import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import LoginPage from "/src/pages/Login"

function Login() {
    return (
      <div className="Login">
        <LoginPage />
      </div>
    );
  }

export const Route = createLazyFileRoute("/login")({
    component: Login,
});
  