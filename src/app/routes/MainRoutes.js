import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminLayout from "../layouts/adminLayout/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Report from "../pages/Admin/Report";
export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" index element={<Dashboard />} />
          <Route path="reports" element={<Report />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
