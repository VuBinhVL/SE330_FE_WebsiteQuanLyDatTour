import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminLayout from "../layouts/adminLayout/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Report from "../pages/Admin/Report";
import CustomerLayout from "../layouts/customerLayout/CustomerLayout";
import Home from "../pages/Customer/Home";
import DestinationMainPage from "../pages/Admin/DestinationManagement/DestinationMainPage";
import Search from "../pages/Customer/Search";
import CustomerMainPage from "../pages/Admin/CustomerManagement/CustomerMainPage";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" index element={<Dashboard />} />
          <Route path="reports" element={<Report />} />
          <Route path="customers" element={<CustomerMainPage />} />
          <Route
            path="destination-management"
            element={<DestinationMainPage />}
          ></Route>
        </Route>

        {/* Customer */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Home />}></Route>
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
