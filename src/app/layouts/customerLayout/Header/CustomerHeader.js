import React, { useEffect, useRef, useState } from "react";
import cart from "../../../assets/icons/customer/header/cart.png";
import search from "../../../assets/icons/customer/header/search.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import avatar from "../../../assets/images/admin/header/avatar.jpg";
import "./CustomerHeader.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaHeart, FaClipboardList } from "react-icons/fa";
import { useAuth } from "../../../lib/AuthContext";

export default function CustomerHeader() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Navigate trang Home
  const handleHome = () => {
    navigate("/");
  };

  // Navigate trang Đăng ký
  const handleRegister = () => {
    navigate("/register");
  };

  // Navigate trang Đăng nhập
  const handleLogin = () => {
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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

  //Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };
  return (
    <header className="customer-header">
      <div className="header-left" onClick={handleHome}>
        <img src={logo} alt="logo" className="logo" />
        <h2 className="logo-text">Website Đặt Tour </h2>
      </div>
      <div className="header-center">
        <img src={search} alt="Icon-Search" className="icon-search" />
        <input
          type="text"
          className="input-search"
          placeholder="Tìm kiếm ..."
        />
        <button className="search-button">SEARCH</button>
      </div>
      <div className="header-right">
        <NavLink to="/admin" className="help-link">
          Trợ giúp
        </NavLink>
        {isLoggedIn ? (
          <>
            <NavLink to="/cart" className="cart-link">
              <img src={cart} alt="Icon-Cart" className="icon-cart" />
            </NavLink>
            <div className="header-account" ref={dropdownRef}>
              <img className="avatar" alt="Avatar" src={avatar} />
              <div className="user-infor">
                <p className="full-name">Hồ Tiến Vũ Bình</p>
                <p className="user-role">Khách hàng</p>
              </div>
              <div className="dropdown-wrapper">
                <span className="dropdown-icon" onClick={toggleDropdown}>
                  ▼
                </span>
                {isOpen && (
                  <div className="dropdown-menu-custom">
                    <ul>
                      <li>
                        <FaClipboardList className="icon-li" /> Đơn đặt chỗ
                      </li>
                      <li>
                        <FaHeart className="icon-li" /> Danh sách yêu thích
                      </li>
                      <li onClick={handleLogout}>
                        <FaSignOutAlt className="icon-li" /> Đăng xuất
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <button className="register-button" onClick={handleRegister}>
              Đăng ký
            </button>
            <button className="login-button" onClick={handleLogin}>
              Đăng nhập
            </button>
          </>
        )}
      </div>
    </header>
  );
}
