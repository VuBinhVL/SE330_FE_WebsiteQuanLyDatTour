import React, { useEffect, useRef, useState } from "react";
import avatar from "../../../assets/images/admin/header/avatar.jpg";
import "./AdminHeader.css";
import { useAuth } from "../../../lib/AuthContext";
export default function AdminHeader() {
  const { setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
  };

  return (
    <header className="header-admin">
      {/* Bên trái */}
      <div className="header-left">
        <h1 className="title">Tất cả điểm tham quan du lịch</h1>
        <p className="subtitle">Thông tin tất cả điểm tham quan du lịch</p>
      </div>

      {/* Bên phải */}
      <div className="header-right" ref={dropdownRef}>
        <img className="avatar" alt="Avatar" src={avatar} />
        <div className="user-infor">
          <p className="full-name">Hồ Tiến Vũ Bình</p>
          <p className="user-role">Quản trị viên</p>
        </div>
        <div className="dropdown-wrapper">
          <span className="dropdown-icon" onClick={toggleDropdown}>
            ▼
          </span>
          {isOpen && (
            <div className="dropdown-menu-custom">
              <ul>
                <li>Thông tin cá nhân</li>
                <li onClick={handleLogout}>Đăng xuất</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
