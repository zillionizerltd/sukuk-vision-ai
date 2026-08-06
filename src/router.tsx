import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// The app lives under /dataroom, but static assets are served from the origin root,
// so the prefix is applied here (router basepath) and NOT via Vite's `base`.
const rawBase = import.meta.env.VITE_ROUTER_BASEPATH ?? "/dataroom/";
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
