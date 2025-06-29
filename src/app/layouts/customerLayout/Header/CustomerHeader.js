import React, { useEffect, useRef, useState } from "react";
import cart from "../../../assets/icons/customer/header/cart.png";
import search from "../../../assets/icons/customer/header/search.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import avatar from "../../../assets/images/admin/header/avatar.jpg";
import "./CustomerHeader.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaHeart, FaClipboardList, FaUser, FaShoppingCart, FaCog, FaTachometerAlt, FaUsers } from "react-icons/fa";
import { useAuth } from "../../../lib/AuthContext";
import { fetchGet, BE_ENDPOINT } from "../../../lib/httpHandler";

export default function CustomerHeader() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Để force refresh avatar
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Hàm chuyển đổi tiếng Việt không dấu
  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Lấy thông tin user khi đã đăng nhập
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && isLoggedIn) {
      fetchGet(
        `/api/admin/user/get/${userId}`,
        (res) => {
          setUserInfo(res.data);
          if (res.data.role_id === 1) {
            setUserRole("customer");
          } else if (res.data.role_id === 2) {
            setUserRole("admin");
          } else if (res.data.role_id === 3) {
            setUserRole("staff");
          } else {
            setUserRole("admin"); // fallback
          }
        },
        () => console.error("Không thể lấy thông tin user")
      );
    } else {
      setUserInfo(null);
      setUserRole(null);
    }
  }, [isLoggedIn]);

  // Lắng nghe event cập nhật user info
  useEffect(() => {
    const handleUserUpdate = () => {
      const userId = localStorage.getItem("userId");
      if (userId && isLoggedIn) {
        // Thêm delay nhỏ để đảm bảo API đã cập nhật
        setTimeout(() => {
          fetchGet(
            `/api/admin/user/get/${userId}`,
            (res) => {
              setUserInfo(res.data);
              if (res.data.role_id === 1) {
                setUserRole("customer");
              } else if (res.data.role_id === 2) {
                setUserRole("admin");
              } else if (res.data.role_id === 3) {
                setUserRole("staff");
              } else {
                setUserRole("admin"); // fallback
              }
              setAvatarKey(Date.now()); // Force refresh avatar
            },
            () => console.error("Không thể lấy thông tin user")
          );
        }, 100);
      }
    };

    window.addEventListener('userInfoUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserUpdate);
    };
  }, [isLoggedIn]);

  // Tìm kiếm tuyến du lịch từ API tour-route/search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Data mẫu nếu API không hoạt động
    const sampleData = [
      { id: 1, name: "Hành trình khám phá miền Bắc", code: "HNCB1", departure: "Hà Nội", destination: "Cao Bằng", type: 'route' },
      { id: 2, name: "Khám phá miền Trung", code: "HĐN2", departure: "Huế", destination: "Đà Nẵng", type: 'route' },
      { id: 3, name: "Hành trình về nguồn", code: "THCMCC3", departure: "TP. Hồ Chí Minh", destination: "Củ Chi", type: 'route' },
      { id: 4, name: "Tour du lịch Hạ Long", code: "HLB4", departure: "Hà Nội", destination: "Quảng Ninh", type: 'route' },
      { id: 5, name: "Khám phá Sapa", code: "SP5", departure: "Hà Nội", destination: "Lào Cai", type: 'route' }
    ];

    try {
      // Fetch chỉ từ tour-route/search API
      const tourRoutesPromise = new Promise((resolve) => {
        fetchGet(
          "/api/admin/tour-route/search",
          (res) => resolve((res.data || res || []).map(item => ({ ...item, type: 'route' }))),
          () => resolve([])
        );
      });

      const routes = await tourRoutesPromise;
      
      if (routes.length > 0) {
        processSearchResults(routes, query);
      } else {
        // Fallback to sample data
        processSearchResults(sampleData, query);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm, using sample data:", error);
      // Fallback to sample data
      processSearchResults(sampleData, query);
    }
  };

  // Xử lý kết quả tìm kiếm - ưu tiên location (departure, destination)
  const processSearchResults = (data, query) => {
    const normalizedQuery = removeVietnameseTones(query.toLowerCase());
    
    // Tách thành 2 nhóm: khớp location trước, khớp name sau
    const locationMatches = [];
    const nameMatches = [];
    
    data.forEach(item => {
      const normalizedName = removeVietnameseTones(item.name.toLowerCase());
      const normalizedDeparture = removeVietnameseTones((item.departure || '').toLowerCase());
      const normalizedDestination = removeVietnameseTones((item.destination || '').toLowerCase());
      
      // Kiểm tra khớp location (departure hoặc destination)
      const locationMatch = normalizedDeparture.includes(normalizedQuery) || 
                          normalizedDestination.includes(normalizedQuery) ||
                          (item.departure || '').toLowerCase().includes(query.toLowerCase()) ||
                          (item.destination || '').toLowerCase().includes(query.toLowerCase());
      
      // Kiểm tra khớp name
      const nameMatch = normalizedName.includes(normalizedQuery) || 
                       item.name.toLowerCase().includes(query.toLowerCase());
      
      if (locationMatch) {
        locationMatches.push(item);
      } else if (nameMatch) {
        nameMatches.push(item);
      }
    });
    
    // Gộp kết quả: location trước, name sau
    const filtered = [...locationMatches, ...nameMatches];
    
    console.log("Filtered results (location first):", filtered); // Debug log
    setSearchResults(filtered.slice(0, 5)); // Chỉ hiển thị 5 kết quả đầu
    setShowSearchResults(true);
  };

  // Xử lý khi nhập vào ô tìm kiếm
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  // Xử lý khi nhấn Enter trong ô tìm kiếm
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Xử lý khi nhấn nút Search
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Navigate đến trang search với query, tránh URL stacking
      const currentPath = window.location.pathname;
      if (currentPath === '/search') {
        // Nếu đang ở trang search, thay thế URL hiện tại
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`, { replace: true });
      } else {
        // Nếu không ở trang search, tạo entry mới
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      }
      // Xóa input và đóng dropdown
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
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

  // Xử lý click vào kết quả tìm kiếm
  const handleSearchResultClick = (item) => {
    const query = `${item.name}`;
    setShowSearchResults(false);
    // Xóa input search
    setSearchQuery("");
    // Navigate đến trang search với destination (ưu tiên destination, fallback departure)
    const destination = item.destination || item.departure || '';
    const currentPath = window.location.pathname;
    
    if (destination) {
      const searchUrl = `/search?destination=${encodeURIComponent(destination)}&query=${encodeURIComponent(query)}`;
      if (currentPath === '/search') {
        navigate(searchUrl, { replace: true });
      } else {
        navigate(searchUrl);
      }
    } else {
      const searchUrl = `/search?query=${encodeURIComponent(query)}`;
      if (currentPath === '/search') {
        navigate(searchUrl, { replace: true });
      } else {
        navigate(searchUrl);
      }
    }
  };

  // Render dropdown menu dựa trên role
  const renderDropdownMenu = () => {
    if (userRole === "customer") {
      return (
        <div className="dropdown-menu-custom">
          <ul>
            <li onClick={() => navigate("/members")}>
              <FaUsers className="icon-li" /> Thành viên
            </li>
            <li onClick={() => navigate("/favorites")}>
              <FaHeart className="icon-li" /> Yêu thích
            </li>
            <li onClick={() => navigate("/cart")}>
              <FaShoppingCart className="icon-li" /> Giỏ hàng
            </li>
            <li onClick={() => navigate("/orders")}>
              <FaClipboardList className="icon-li" /> Đơn hàng
            </li>
            <li onClick={() => navigate("/account")}>
              <FaCog className="icon-li" /> Tài khoản
            </li>
            <li onClick={handleLogout}>
              <FaSignOutAlt className="icon-li" /> Đăng xuất
            </li>
          </ul>
        </div>
      );
    } else if (userRole === "admin" || userRole === "staff") {
      return (
        <div className="dropdown-menu-custom">
          <ul>
            <li onClick={() => navigate("/account")}>
              <FaUser className="icon-li" /> Thông tin tài khoản
            </li>
            <li onClick={() => navigate("/admin/dashboard")}>
              <FaTachometerAlt className="icon-li" /> Trang quản lý
            </li>
            <li onClick={handleLogout}>
              <FaSignOutAlt className="icon-li" /> Đăng xuất
            </li>
          </ul>
        </div>
      );
    }
    return null;
  };
  return (
    <header className="customer-header">
      <div className="header-left" onClick={handleHome}>
        <img src={logo} alt="logo" className="logo" />
        <h2 className="logo-text">Website Đặt Tour </h2>
      </div>
      <div className="header-center" ref={searchRef} style={{ position: 'relative' }}>
        <img src={search} alt="Icon-Search" className="icon-search" />
        <input
          type="text"
          className="input-search"
          placeholder="Tìm kiếm địa điểm..."
          value={searchQuery}
          onChange={handleSearchInput}
          onKeyPress={handleSearchKeyPress}
          onFocus={() => searchQuery && setShowSearchResults(true)}
        />
        <button className="search-button" onClick={handleSearchSubmit}>SEARCH</button>
        
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="search-result-item"
                onClick={() => handleSearchResultClick(item)}
              >
                <div className="result-name">{item.name}</div>
                <div className="result-location">
                  {item.departure && item.destination 
                    ? `${item.departure} → ${item.destination}` 
                    : (item.departure || item.destination || 'Tuyến du lịch')
                  }
                  {item.code && ` • ${item.code}`}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
          <div className="search-results-dropdown">
            <div className="search-result-item no-results">
              <div className="result-name">Không tìm thấy kết quả</div>
              <div className="result-location">Thử tìm kiếm với từ khóa khác</div>
            </div>
          </div>
        )}
      </div>
      <div className="header-right">
        <NavLink to="/admin" className="help-link">
          Trợ giúp
        </NavLink>
        {isLoggedIn ? (
          <>
            {userRole === "customer" && (
              <NavLink to="/cart" className="cart-link">
                <img src={cart} alt="Icon-Cart" className="icon-cart" />
              </NavLink>
            )}
            <div className="header-account" ref={dropdownRef}>
              <img 
                key={`avatar-${avatarKey}`}
                className="avatar" 
                alt="Avatar" 
                src={
                  userInfo?.avatar
                    ? userInfo.avatar.startsWith("http")
                      ? `${userInfo.avatar}?t=${avatarKey}`
                      : `${BE_ENDPOINT}${userInfo.avatar}?t=${avatarKey}`
                    : avatar
                } 
              />
              <div className="user-infor">
                <p className="full-name">{userInfo?.fullname || "Đang tải..."}</p>
                <p className="user-role">
                  {userRole === "admin" ? "Quản trị viên" : 
                   userRole === "staff" ? "Nhân viên" : "Khách hàng"}
                </p>
              </div>
              <div className="dropdown-wrapper">
                <span className="dropdown-icon" onClick={toggleDropdown}>
                  ▼
                </span>
                {isOpen && renderDropdownMenu()}
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
