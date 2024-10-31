import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Navbar from "/src/components/Fragments/Navbar";

// It's the layout component
export const Route = createRootRoute({
  component: () => (
    <div>
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
});
