import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Base path (e.g. /dataroom/) comes from Vite's `base`, set via VITE_BASE_PATH.
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
