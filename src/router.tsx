import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// When deployed under /dataroom, set VITE_BASE_PATH=/dataroom/ at build time
// and this basepath will be picked up automatically. Preview runs at root.
const rawBase = import.meta.env.BASE_URL ?? "/";
const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath,
  });

  return router;
};
