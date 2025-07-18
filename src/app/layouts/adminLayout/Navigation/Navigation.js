import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchGet } from "../../../lib/httpHandler";
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
  const [userRole, setUserRole] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchGet(
        `/api/admin/user/get/${userId}`,
        (res) => {
          setUserRole(res.data.role_id);
        },
        (error) => {
          console.error("Error fetching user role:", error);
        }
      );
    }
  }, [userId]);

  const isAdmin = userRole === 2;
  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />
        <h2>Quản lý đặt tour</h2>
      </div>

      <nav className="nav-links">
        {/* Dashboard chung cho cả Admin và Staff */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <img src={dashboard} alt="Dashboard Icon" className="icon" />
          Trang chủ
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <img src={customer} alt="Customer Icon" className="icon" />
          Quản lý khách hàng
        </NavLink>
        {/* Chỉ Admin mới thấy các mục quản lý này */}
        {isAdmin && (
          <>
            <NavLink
              to="/admin/staff"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              <img src={staff} alt="Staff Icon" className="icon" />
              Quản lý nhân viên
            </NavLink>

            <NavLink
              to="/admin/tour-route"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              <img src={tour_route} alt="Tour Route Icon" className="icon" />
              Quản lý tuyến du lịch
            </NavLink>
          </>
        )}

        {/* Cả Admin và Staff đều thấy các mục này */}
        <NavLink
          to="/admin/tour"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <img src={trip} alt="Trip Icon" className="icon" />
          Quản lý chuyến du lịch
        </NavLink>
        <NavLink
          to="/admin/tour-bookings"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <img src={tour_booking} alt="Tour Booking Icon" className="icon" />
          Quản lý phiếu đặt tour
        </NavLink>

        <NavLink
          to="/admin/invoices"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <img src={invoice} alt="Invoice Icon" className="icon" />
          Quản lý hóa đơn
        </NavLink>

        {/* Chỉ Admin mới thấy các mục này */}
        {isAdmin && (
          <>
            <NavLink
              to="/admin/destination-management"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              <img src={destination} alt="Destination Icon" className="icon" />
              Quản lý địa điểm
            </NavLink>

            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              <img src={report} alt="Report Icon" className="icon" />
              Báo cáo doanh thu
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
