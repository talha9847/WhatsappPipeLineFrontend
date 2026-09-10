import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MessagesPage from "./components/MessagePage";
import NotFound from "./components/NotFound";
import LandingPage from "./front/LandingPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
