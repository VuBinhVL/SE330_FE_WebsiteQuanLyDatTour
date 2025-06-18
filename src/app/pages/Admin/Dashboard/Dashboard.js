import React, { useState, useContext, useEffect } from "react";
import { AdminTitleContext } from "../../../layouts/adminLayout/AdminLayout/AdminLayout";
import "./Dashboard.css";
import CalendarLogo from "../../../assets/icons/admin/DashBoard/calendar-heart-01.svg";

// Mock data
const favoriteRoutes = [
  {
    id: 1,
    name: "teamLab Borderless Ticket: World Building DIGITAL ART",
    location: "Museums Tokyo",
    price: 8189000,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "teamLab Borderless Ticket: World Building DIGITAL ART",
    location: "Museums Tokyo",
    price: 8189000,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "teamLab Borderless Ticket: World Building DIGITAL ART",
    location: "Museums Tokyo",
    price: 8189000,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "teamLab Borderless Ticket: World Building DIGITAL ART",
    location: "Museums Tokyo",
    price: 8189000,
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
  },
];

const recentTickets = [
  {
    id: 1,
    route: "Nhật Bản: Fukushima - Tochigi - Công viên Ashikaga - Tokyo - Núi Phú Sĩ - Làng",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80",
    quantity: 3,
    status: "Hoàn tất",
  },
  {
    id: 2,
    route: "Nhật Bản: Fukushima - Tochigi - Công viên Ashikaga - Tokyo - Núi Phú Sĩ - Làng",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=80&q=80",
    quantity: 2,
    status: "Đang chờ",
  },
  {
    id: 3,
    route: "Nhật Bản: Fukushima - Tochigi - Công viên Ashikaga - Tokyo - Núi Phú Sĩ - Làng",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=80&q=80",
    quantity: 1,
    status: "Hoàn tất",
  },
  {
    id: 4,
    route: "Nhật Bản: Fukushima - Tochigi - Công viên Ashikaga - Tokyo - Núi Phú Sĩ - Làng",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=80&q=80",
    quantity: 7,
    status: "Đã huỷ",
  },
  {
    id: 5,
    route: "Nhật Bản: Fukushima - Tochigi - Công viên Ashikaga - Tokyo - Núi Phú Sĩ - Làng",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80",
    quantity: 5,
    status: "Hoàn tất",
  },
];

const statusColor = {
  "Hoàn tất": "#4CAF50",
  "Đang chờ": "#FF9800",
  "Đã huỷ": "#F44336",
};

const favoritePlaces = [
  {
    name: "Cối xay gió Hà Lan",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Cầu Vàng Đà Nẵng",
    image: "http://localhost:8081/uploads/avatars/abc.jpg",
  },
  {
    name: "Phố cổ Hà Nội",
    image: "http://localhost:8081/uploads/avatars/123.png",
  },
  {
    name: "Cánh đồng hoa Hà Lan",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Chùa Thiên Mụ",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Thành phố Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Hồ Gươm",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
  },
];

// Fake API cho chuyến đi trong tháng
const tripDaysInfo = [
  { day: 6, name: "Tour Nhật Bản: Tokyo - Núi Phú Sĩ" },
  { day: 11, name: "Tour Hà Lan: Cối xay gió & hoa tulip" },
  { day: 14, name: "Tour Đà Nẵng: Cầu Vàng & Bà Nà Hills" },
  { day: 20, name: "Tour Hà Nội: Phố cổ & Hồ Gươm" },
];
const tripDays = tripDaysInfo.map(t => t.day);

function Calendar({ year, month, tripDays }) {
  // month: 1-based (3 = March)
  const weeks = [];
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0: CN
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
  
    useEffect(() => {
      setTitle("Trang chủ");
      setSubtitle("Thông tin tổng quan hệ thống");
    }, [setTitle, setSubtitle]);


  const today = new Date();
  const year = today.getFullYear();
  const month = 3; // Tháng 3 (March)

  return (
    <div className="home-main-grid">
      <div className="home-left">
        <div className="home-card home-fav-routes">
          <h3>Danh sách tuyến du lịch được ưa thích</h3>
          <div className="fav-routes-list">
            {favoriteRoutes.map((route) => (
              <div className="fav-route-item" key={route.id}>
                <img src={route.image} alt={route.name} />
                <div className="fav-route-info">
                  <div className="fav-route-location">{route.location}</div>
                  <div className="fav-route-name">{route.name}</div>
                  <div className="fav-route-price">
                    Giá: <b>{route.price.toLocaleString("vi-VN")}₫</b>
                  </div>
                </div>
                <button className="fav-route-detail-btn">Xem chi tiết</button>
              </div>
            ))}
          </div>
        </div>
        <div className="home-card home-recent-tickets">
          <h3>Đặt vé gần đây</h3>
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
                    <img src={ticket.image} alt="" className="recent-ticket-img" />
                  </td>
                  <td>{ticket.route}</td>
                  <td style={{ textAlign: "center" }}>{ticket.quantity}</td>
                  <td>
                    <span
                      className="ticket-status"
                      style={{
                        background: statusColor[ticket.status] + "22",
                        color: statusColor[ticket.status],
                        border: `1px solid ${statusColor[ticket.status]}`
                      }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="home-right">
        <div className="home-card home-calendar">
          <div className="calendar-header">
            <span>Chuyến đi trong tháng</span>
            <span className="calendar-icon">
              <img src={CalendarLogo} alt="calendar" style={{ width: 34, height: 34, verticalAlign: "middle" }} />
            </span>
          </div>
          <div className="calendar-month">
            Tháng 3, {year}
          </div>
          <Calendar year={year} month={month} tripDays={tripDays} />
        </div>
        <div className="home-card home-fav-places">
            <div className="fav-places-header-centered">
          <span className="fav-places-title">Địa điểm du lịch được yêu thích</span>
          <hr className="fav-places-divider" />
          <button className="fav-places-btn-centered">Xem toàn bộ</button>
        </div>
          <div className="fav-places-grid">
  {favoritePlaces.map((place, idx) => (
    <div className="fav-place-img-wrap" key={idx}>
      <img src={place.image} alt={place.name} />
      <div className="fav-place-overlay">
        <span>{place.name}</span>
      </div>
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
}