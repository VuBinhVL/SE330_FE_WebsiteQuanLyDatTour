import React from "react";
import cart from "../../../assets/icons/customer/header/cart.png";
import search from "../../../assets/icons/customer/header/search.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import "./CustomerHeader.css";
import { NavLink, useNavigate } from "react-router-dom";

export default function CustomerHeader() {
  const navigate = useNavigate();
  // Navigate trang Home
  const handleHome = () => {
    navigate("/admin");
  };

  // Navigate trang Đăng ký
  const handleRegister = () => {
    navigate("/register");
  };

  // Navigate trang Đăng nhập
  const handleLogin = () => {
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
        <button className="register-button" onClick={handleRegister}>
          Đăng ký
        </button>
        <button className="login-button" onClick={handleLogin}>
          Đăng nhập
        </button>
      </div>
    </header>
  );
}
