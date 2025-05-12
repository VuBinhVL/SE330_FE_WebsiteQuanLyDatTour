import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import dashboard from "../../../assets/icons/admin/navigation/dashboard.png";
import customer from "../../../assets/icons/admin/navigation/customer.png";
import staff from "../../../assets/icons/admin/navigation/staff.png";
import tour_route from "../../../assets/icons/admin/navigation/tour-route.png";
import trip from "../../../assets/icons/admin/navigation/trip.png";
import tour_booking from "../../../assets/icons/admin/navigation/tour-bookinng.png";
import invoice from "../../../assets/icons/admin/navigation/invoice.png";
import destination from "../../../assets/icons/admin/navigation/destination.png";
import report from "../../../assets/icons/admin/navigation/report.png";
import "./Navigation.css";

export default function Navigation() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />
        <h2>Quản lý đặt tour</h2>
      </div>

      <nav className="nav-links">
        <NavLink to="/admin" className="nav-item">
          <img src={dashboard} alt="Logo" className="icon" />
          Trang chủ
        </NavLink>

        <NavLink className="nav-item">
          <img src={customer} className="icon" alt="icon" />
          Quản lý khách hàng
        </NavLink>

        <NavLink className="nav-item">
          <img src={staff} className="icon" alt="icon" />
          Quản lý nhân viên
        </NavLink>

        <NavLink className="nav-item">
          <img src={tour_route} className="icon" alt="icon" />
          Quản lý tuyến du lịch
        </NavLink>

        <NavLink className="nav-item">
          <img src={trip} className="icon" alt="icon" />
          Quản lý chuyến du lịch
        </NavLink>

        <NavLink className="nav-item">
          <img src={tour_booking} className="icon" alt="icon" />
          Quản lý phiếu đặt tour
        </NavLink>

        <NavLink className="nav-item">
          <img src={invoice} className="icon" alt="icon" />
          Quản lý hóa đơn
        </NavLink>

        <NavLink className="nav-item">
          <img src={destination} className="icon" alt="icon" />
          Quản lý địa điểm
        </NavLink>

        <NavLink className="nav-item">
          <img src={report} className="icon" alt="icon" />
          Báo cáo doanh thu
        </NavLink>
      </nav>
    </aside>
  );
}
