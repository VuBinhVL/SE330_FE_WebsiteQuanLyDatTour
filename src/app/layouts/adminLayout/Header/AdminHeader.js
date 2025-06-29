import React, { useEffect, useRef, useState, useContext } from "react";
import { AdminTitleContext } from "../AdminLayout/AdminLayout";
import avatar from "../../../assets/images/admin/header/avatar.jpg";
import "./AdminHeader.css";
import { useAuth } from "../../../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchGet, BE_ENDPOINT } from "../../../lib/httpHandler";

export default function AdminHeader() {
  const { title, subtitle } = useContext(AdminTitleContext);
  const { setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Để force refresh avatar
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Lấy thông tin user từ API
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchGet(
        `/api/admin/user/get/${userId}`,
        (res) => {
          setUserInfo(res.data);
        },
        (error) => {
          console.error("Không thể lấy thông tin user:", error);
        }
      );
    }
  }, []);

  // Lắng nghe event cập nhật user info
  useEffect(() => {
    const handleUserUpdate = () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Thêm delay nhỏ để đảm bảo API đã cập nhật
        setTimeout(() => {
          fetchGet(
            `/api/admin/user/get/${userId}`,
            (res) => {
              setUserInfo(res.data);
              setAvatarKey(Date.now()); // Force refresh avatar
            },
            (error) => {
              console.error("Không thể lấy thông tin user:", error);
            }
          );
        }, 100);
      }
    };

    window.addEventListener('userInfoUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserUpdate);
    };
  }, []);

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

  // Chuyển đến trang khách hàng
  const handleCustomerPage = () => {
    navigate("/");
    setIsOpen(false);
  };

  // Kiểm tra và lấy avatar URL
  const getAvatarUrl = () => {
    if (userInfo?.avatar) {
      const baseUrl = userInfo.avatar.startsWith('http') 
        ? userInfo.avatar 
        : `${BE_ENDPOINT}${userInfo.avatar}`;
      // Thêm cache buster để force refresh
      return `${baseUrl}?t=${avatarKey}`;
    }
    return avatar; // fallback avatar
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
        <img 
          key={`avatar-${avatarKey}`}
          className="avatar" 
          alt="Avatar" 
          src={getAvatarUrl()} 
        />
        <div className="user-infor">
          <p className="full-name">{userInfo?.fullname || "Đang tải..."}</p>
          <p className="user-role">
            {userInfo?.role_id === 2 ? "Quản trị viên" : 
             userInfo?.role_id === 3 ? "Nhân viên" : "Đang tải..."}
          </p>
        </div>
        <div className="dropdown-wrapper">
          <span className="dropdown-icon" onClick={toggleDropdown}>
            ▼
          </span>
          {isOpen && (
            <div className="dropdown-menu-custom">
              <ul>
                <li onClick={handleAccount}>Thông tin cá nhân</li>
                <li onClick={handleCustomerPage}>Trang khách hàng</li>
                <li onClick={handleLogout}>Đăng xuất</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}