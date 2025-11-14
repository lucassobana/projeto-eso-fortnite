import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "../pages/login/Login";
import { App } from "../App";
import { Register } from "../pages/register/Register";
import { MyItems } from "../pages/itens/MyItens";
import { History } from "../pages/history/History";
import { UserList } from "../pages/users/UserList";
import { UserProfile } from "../pages/user-profile/UserProfile";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-itens" element={<MyItems />} />
        <Route path="/history" element={<History />} />
        <Route path="/all-users" element={<UserList />} />
        <Route path="/all-users/:userId" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}
