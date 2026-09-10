import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";

// =====================================================
// DASHBOARD LAYOUT
// =====================================================
//
// Usage:
//   <DashboardLayout title="Messages">
//     <MessagesPage />
//   </DashboardLayout>
//
// Or with react-router's <Outlet /> as children if you'd
// rather nest routes under a layout route.

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white md:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardNavbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
