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
import TourRouteMainPage from "../pages/Admin/TourRouteManagement/TourRouteMainPage";
import DetailTourRoute from "../components/Admin/TourRouteManagement/DetailTourRoute/DetailTourRoute";
import TourMainPage from "../pages/Admin/TourManagement/TourMainPage";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" index element={<Dashboard />} />
          <Route path="reports" element={<Report />} />
          <Route path="customers" element={<CustomerMainPage />} />
           <Route path="tour-routes" element={<TourRouteMainPage />} />
           <Route path="/admin/tour-routes/detail/:id" element={<DetailTourRoute />} />
           <Route path="tours" element={<TourMainPage />} />
          <Route
            path="destination-management"
            element={<DestinationMainPage />}
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
