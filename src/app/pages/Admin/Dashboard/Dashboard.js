import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTitleContext } from "../../../layouts/adminLayout/AdminLayout/AdminLayout";
import "./Dashboard.css";
import CalendarLogo from "../../../assets/icons/admin/DashBoard/calendar-heart-01.svg";
import { fetchGet, BE_ENDPOINT } from "../../../lib/httpHandler";

const statusColor = {
  "Hoàn tất": "#4CAF50",
  "Đang chờ": "#FF9800",
  "Đã huỷ": "#F44336",
};

// Helper function to convert status boolean to Vietnamese text
const getStatusText = (status) => {
  return status ? "Hoàn tất" : "Đang chờ";
};

// Calendar component
function Calendar({ year, month, tripDaysInfo }) {
  const weeks = [];
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      week.push(day > 0 && day <= daysInMonth ? day : null);
    }
    weeks.push(week);
  }
  return (
    <table className="calendar-table">
      <thead>
        <tr>
          <th>CN</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th>
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, i) => (
          <tr key={i}>
            {week.map((d, j) => {
              const trip = tripDaysInfo.find(t => t.day === d);
              return d ? (
                <td
                  key={j}
                  className={trip ? "calendar-trip-day calendar-trip-day-hover" : ""}
                >
                  <span className="calendar-day-number">{d}</span>
                  {trip && (
                    <div className="calendar-trip-tooltip">{trip.name}</div>
                  )}
                </td>
              ) : (
                <td key={j}></td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Dashboard() {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);
  const navigate = useNavigate();

  // State
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [tripDaysInfo, setTripDaysInfo] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    setTitle("Trang chủ");
    setSubtitle("Thông tin tổng quan hệ thống");
  }, [setTitle, setSubtitle]);

  // Lấy top 5 tuyến du lịch được ưa thích (chỉ lấy 4 để hiển thị)
  useEffect(() => {
    fetchGet(
      "/api/admin/tour/top-5-popular-tour-routes",
      (res) => setFavoriteRoutes((res.data || []).slice(0, 4)),
      () => setFavoriteRoutes([])
    );
  }, []);

  // Lấy top 5 địa điểm du lịch được ưa thích
  useEffect(() => {
    fetchGet(
      "/api/admin/tourist-attraction/top-5-favorite",
      (res) => setFavoritePlaces(res.data || []),
      () => setFavoritePlaces([])
    );
  }, []);

  // Lấy danh sách đặt vé gần đây
  useEffect(() => {
    fetchGet(
      "/api/admin/tour-booking/admin-home-bookings",
      (res) => setRecentTickets(res.data || []),
      () => setRecentTickets([])
    );
  }, []);

  // Lấy danh sách chuyến đi trong tháng được chọn
  useEffect(() => {
    fetchGet(
      "/api/admin/tour-route/get-all",
      (res) => {
        const data = res.data || [];
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        const trips = data
          .map(t => ({
            day: new Date(t.startDate).getMonth() + 1 === month && new Date(t.startDate).getFullYear() === year
              ? new Date(t.startDate).getDate()
              : null,
            name: t.routeName || "Chuyến đi",
          }))
          .filter(t => t.day);
        setTripDaysInfo(trips);
      },
      () => setTripDaysInfo([])
    );
  }, [selectedDate]); // Dependency thay đổi từ [] thành [selectedDate]

  // Xử lý thay đổi tháng
  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value + '-01');
    setSelectedDate(newDate);
  };

  // Render favorite places with 4x3 grid layout
  function renderFavoritePlaces() {
    const defaultImg = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80";
    const places = [...favoritePlaces];
    
    // Ensure we have exactly 5 places
    while (places.length < 5) {
      places.push({ 
        name: `Địa điểm ${places.length + 1}`, 
        image: defaultImg 
      });
    }

    return (
      <div className="fav-places-image-grid">
        {/* Header Section - Grid positions 1, 2 */}
        <div className="fav-places-header-section">
          <h3 className="fav-places-title">Địa điểm du lịch được yêu thích</h3>
          <div className="fav-places-divider"></div>
          <button
            className="fav-places-btn-view-all"
            onClick={() => navigate("/admin/destination-management")}
          >
            Xem toàn bộ
          </button>
        </div>

        {/* Large square image - Grid positions 3, 4, 7, 8 */}
        <div className={`fav-place-img-wrap fav-places-large-square`}>
          <img src={places[0].image} alt={places[0].name} />
          <div className="fav-place-overlay">
            <span>{places[0].name}</span>
          </div>
        </div>

        {/* Small square 1 - Grid position 5 */}
        <div className={`fav-place-img-wrap fav-places-small-square-1`}>
          <img src={places[1].image} alt={places[1].name} />
          <div className="fav-place-overlay">
            <span>{places[1].name}</span>
          </div>
        </div>

        {/* Small square 2 - Grid position 9 */}
        <div className={`fav-place-img-wrap fav-places-small-square-2`}>
          <img src={places[2].image} alt={places[2].name} />
          <div className="fav-place-overlay">
            <span>{places[2].name}</span>
          </div>
        </div>

        {/* Rectangle vertical - Grid positions 6, 10 */}
        <div className={`fav-place-img-wrap fav-places-rectangle-vertical`}>
          <img src={places[3].image} alt={places[3].name} />
          <div className="fav-place-overlay">
            <span>{places[3].name}</span>
          </div>
        </div>

        {/* Rectangle horizontal - Grid positions 11, 12 */}
        <div className={`fav-place-img-wrap fav-places-rectangle-horizontal`}>
          <img src={places[4].image} alt={places[4].name} />
          <div className="fav-place-overlay">
            <span>{places[4].name}</span>
          </div>
        </div>
      </div>
    );
  }

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  return (
    <div className="home-main-grid">
      <div className="home-left">
        <div className="home-card home-fav-routes">
          <h3>Danh sách tuyến du lịch được ưa thích</h3>
          <div className="fav-routes-list">
            {favoriteRoutes.map((route) => (
              <div className="fav-route-item" key={route.id}>
                <img
                  src={
                    route.image?.startsWith("http")
                      ? route.image
                      : `${BE_ENDPOINT}/${route.image}`
                  }
                  alt={route.routeName}
                />
                <div className="fav-route-info">
                  <div className="fav-route-location">
                    {route.startLocation} → {route.endLocation}
                  </div>
                  <div className="fav-route-name">{route.routeName}</div>
                  <div className="fav-route-duration">
                    Thời gian: <b>{route.durationDays}N{route.durationDays - 1}Đ</b>
                  </div>
                  {route.recentStartDates && route.recentStartDates.length > 0 && (
                    <div className="fav-route-start-date">
                      Khởi hành: <b>{new Date(route.recentStartDates[0]).toLocaleDateString("vi-VN")}</b>
                    </div>
                  )}
                  <div className="fav-route-price">
                    Giá: <b>{Number(route.latestPrice).toLocaleString("vi-VN")}₫</b>
                  </div>
                </div>
                <button
                  className="fav-route-detail-btn"
                  onClick={() => navigate(`/admin/tour-route/get/${route.id}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="home-card home-recent-tickets">
          <h3>Đặt vé gần đây</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Tên tuyến du lịch</th>
                  <th>Số vé</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <img 
                        src={
                          ticket.image?.startsWith("http")
                            ? ticket.image
                            : `${BE_ENDPOINT}/${ticket.image}`
                        } 
                        alt="" 
                        className="recent-ticket-img" 
                      />
                    </td>
                    <td>{ticket.route}</td>
                    <td style={{ textAlign: "center" }}>{ticket.quantity}</td>
                    <td>
                      <span
                        className="ticket-status"
                        style={{
                          background: statusColor[getStatusText(ticket.status)] + "22",
                          color: statusColor[getStatusText(ticket.status)],
                          border: `1px solid ${statusColor[getStatusText(ticket.status)]}`
                        }}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="home-right">
        <div className="home-card home-calendar">
          <div className="calendar-header">
            <span>Chuyến đi trong tháng</span>
            <div className="calendar-icon" style={{ position: 'relative' }}>
              <img 
                src={CalendarLogo} 
                alt="calendar" 
                style={{ width: 34, height: 34, verticalAlign: "middle" }}
              />
              <input
                type="month"
                value={`${year}-${month.toString().padStart(2, '0')}`}
                onChange={handleDateChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          <div className="calendar-month">
            Tháng {month}, {year}
          </div>
          <Calendar year={year} month={month} tripDaysInfo={tripDaysInfo} />
        </div>
        <div className="home-card home-fav-places">
          {renderFavoritePlaces()}
        </div>
      </div>
    </div>
  );
}