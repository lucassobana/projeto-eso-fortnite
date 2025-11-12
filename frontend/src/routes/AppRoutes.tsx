import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "../pages/login/Login";
import { App } from "../App";
import { Register } from "../pages/register/Register";
import { MyItems } from "../pages/itens/MyItens";
import { History } from "../pages/history/History";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-itens" element={<MyItems />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
