import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "../pages/login/Login";
import { App } from "../App";
import { Register } from "../pages/register/Register";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
