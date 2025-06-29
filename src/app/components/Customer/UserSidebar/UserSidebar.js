import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserFriends,
  FaHeart,
  FaShoppingCart,
  FaClipboardList,
  FaCog,
} from "react-icons/fa";
import defaultAvatar from "../../../assets/images/customer/default-avatar.png";
import { BE_ENDPOINT, fetchGet } from "../../../lib/httpHandler";

import "./UserSidebar.css";

export default function UserSidebar() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: defaultAvatar,
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchGet(
        `/api/admin/user/get/${userId}`,
        (res) => {
          const userData = res.data;
          setUser({
            name: userData.fullname || "Người dùng",
            email: userData.email || "",
            avatar: userData.avatar
              ? userData.avatar.startsWith("http")
                ? userData.avatar
                : BE_ENDPOINT + userData.avatar
              : defaultAvatar,
          });
        },
        () => {
          // Keep default values if fetch fails
        }
      );
    }
  }, [userId]);

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
