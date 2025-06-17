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
import Login from "../pages/Other/Login";
import Register from "../pages/Other/Register";
import ForgetPassword from "../pages/Other/ForgetPassword";
import Search from "../pages/Customer/Search";
import CustomerMainPage from "../pages/Admin/CustomerManagement/CustomerMainPage";
import EmployeeManagement from "../pages/Admin/EmployeeManagement/EmployeeManagement";
import TourBookingManagement from "../pages/Admin/TourBookingManagement/TourBookingManagement";
import BookingDetail from "../pages/Admin/TourBookingManagement/BookingDetail";
import OrderManagement from "../pages/Admin/OrderManagement/OrderManagement";
import OrderDetail from "../pages/Admin/OrderManagement/OrderDetail";

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
          <Route
            path="staff"
            element={<EmployeeManagement />}
          ></Route>

          <Route
            path="tour-bookings"
            element={<TourBookingManagement />}
          ></Route>
          <Route
            path="tour-bookings/detail-booking/:id"
            element={<BookingDetail />}
          ></Route>

          <Route
            path="invoices"
            element={<OrderManagement />}
          ></Route>
          <Route
            path="invoices/detail/:id"
            element={<OrderDetail />}
          ></Route>

        </Route>

        {/* Customer */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />}></Route>
          <Route path="search" element={<Search />} />
          <Route path="login" element={<Login />}></Route>
          <Route path="register" element={<Register />}></Route>
          <Route path="forget-password" element={<ForgetPassword />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
