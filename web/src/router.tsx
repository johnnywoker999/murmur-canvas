import { createBrowserRouter, Outlet } from "react-router-dom";

import { AnalyticsTracker } from "@/components/layout/analytics-tracker";
import UserLayout from "@/layouts/user-layout";
import AssetsPage from "@/pages/assets";
import CanvasPage from "@/pages/canvas";
import CanvasProjectPage from "@/pages/canvas/project";
import ConfigPage from "@/pages/config";
import GuidePage from "@/pages/guide";
import HomePage from "@/pages/home";
import ImagePage from "@/pages/image";
import NotFound from "@/pages/not-found";
import PricingPage from "@/pages/pricing";
import PromptsPage from "@/pages/prompts";
import VideoPage from "@/pages/video";
import WorkflowEditorPage from "@/pages/workflow-editor";
import WorkflowsPage from "@/pages/workflows";

// GitHub Pages 等子路徑部署：base 由 vite 的 VITE_BASE 注入
const routerBase = String(import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

export const router = createBrowserRouter([
    {
        element: (
            <UserLayout>
                <AnalyticsTracker />
                <Outlet />
            </UserLayout>
        ),
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/image", element: <ImagePage /> },
            { path: "/video", element: <VideoPage /> },
            { path: "/workflows", element: <WorkflowsPage /> },
            { path: "/assets", element: <AssetsPage /> },
            { path: "/prompts", element: <PromptsPage /> },
            { path: "/canvas", element: <CanvasPage /> },
            { path: "/canvas/:id", element: <CanvasProjectPage /> },
            { path: "/config", element: <ConfigPage /> },
            { path: "/config/workflows/:channelId/:workflowId", element: <WorkflowEditorPage /> },
            { path: "/guide", element: <GuidePage /> },
            { path: "/pricing", element: <PricingPage /> },
        ],
    },
    { path: "*", element: <NotFound /> },
], { basename: routerBase || "/" });
