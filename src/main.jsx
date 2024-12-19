import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Consumer from "./Consumer.jsx";
import Worker from "./Worker.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Add root route */}
        <Route path="/admin" element={<App />} />
        <Route path="/consumer" element={<Consumer />} />
        <Route path="/worker" element={<Worker />} />
      </Routes>
    </Router>
  </StrictMode>
);
