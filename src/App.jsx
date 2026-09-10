import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MessagesPage from "./components/MessagePage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MessagesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
