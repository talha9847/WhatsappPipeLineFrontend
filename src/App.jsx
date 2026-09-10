import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MessagesPage from "./components/MessagePage";
import DashboardLayout from "./components/DashboardLayout";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />} />

        <Route
          path="/dashboard/messages"
          element={
            <DashboardLayout title="Messages">
              <MessagesPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
