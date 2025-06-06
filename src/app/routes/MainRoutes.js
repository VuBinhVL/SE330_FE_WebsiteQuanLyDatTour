import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminLayout from "../layouts/adminLayout/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import CustomerLayout from "../layouts/customerLayout/CustomerLayout";
import Home from "../pages/Customer/Home";
import DestinationMainPage from "../pages/Admin/DestinationManagement/DestinationMainPage";
import Login from "../pages/Other/Login";
import Register from "../pages/Other/Register";
import ForgetPassword from "../pages/Other/ForgetPassword";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />}></Route>
          <Route
            path="destination-management"
            element={<DestinationMainPage />}
          ></Route>
        </Route>

        {/* Customer */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />}></Route>
          <Route path="login" element={<Login />}></Route>
          <Route path="register" element={<Register />}></Route>
          <Route path="forget-password" element={<ForgetPassword />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
