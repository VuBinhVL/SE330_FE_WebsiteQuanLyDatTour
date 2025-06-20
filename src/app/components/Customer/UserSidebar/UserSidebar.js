import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserFriends,
  FaHeart,
  FaShoppingCart,
  FaClipboardList,
  FaCog,
} from "react-icons/fa";
import avatar from "../../../assets/images/admin/header/avatar.jpg";

import "./UserSidebar.css";

export default function UserSidebar() {
  const user = {
    name: "Hồ Tiến Vũ Bình",
    email: "22520129@gm.uit.edu.vn",
    avatar: avatar,
  };

  const menu = [
    { label: "Danh sách thành viên", icon: <FaUserFriends />, to: "/members" },
    { label: "Yêu thích đã lưu", icon: <FaHeart />, to: "/favorites" },
    { label: "Giỏ hàng", icon: <FaShoppingCart />, to: "/cart" },
    { label: "Đơn đặt chỗ", icon: <FaClipboardList />, to: "/bookings" },
    { label: "Tài khoản", icon: <FaCog />, to: "/account" },
  ];

  return (
    <aside className="user-sidebar">
      <div className="user-info">
        <img src={user.avatar} alt="avatar" className="user-avatar" />
        <p className="user-name">{user.name}</p>
        <p className="user-email">{user.email}</p>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
