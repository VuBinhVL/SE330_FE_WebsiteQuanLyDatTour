import React, { useEffect, useRef, useState, useContext } from "react";
import { AdminTitleContext } from "../AdminLayout/AdminLayout";
import avatar from "../../../assets/images/admin/header/avatar.jpg";
import "./AdminHeader.css";
import { useAuth } from "../../../lib/AuthContext";
import { useNavigate } from "react-router-dom"; // Thêm dòng này

export default function AdminHeader() {
  const { title, subtitle } = useContext(AdminTitleContext);
  const { setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Thêm dòng này

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

  // Thêm hàm chuyển hướng
  const handleAccount = () => {
    navigate("/account");
    setIsOpen(false);
  };

  return (
    <header className="header-admin">
      {/* Bên trái */}
      <div className="header-left">
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
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
                <li onClick={handleAccount}>Thông tin cá nhân</li>
                <li onClick={handleLogout}>Đăng xuất</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}