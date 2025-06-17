import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TourBookingManagement.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";

const initialBookings = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  customerName: "Đặng Phú Thiện",
  totalAmount: "8.190.000",
  tourName: "Thái Lan: Bangkok - Pattaya (Làng Nong Nooch)",
  bookingDate: "17/04/2025",
  seats: 3,
  status: i % 3 === 0 ? "Đã thanh toán" : i % 3 === 1 ? "Đang chờ" : "Đã hủy",
}));

const getStatusClass = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return "status-paid";
    case "Đang chờ":
      return "status-pending";
    case "Đã hủy":
      return "status-cancelled";
    default:
      return "";
  }
};

export default function TourBookingManagement() {
  const [bookings] = useState(initialBookings);
  const navigate = useNavigate();

  const handleView = (booking) => {
  navigate(`/admin/tour-booking-management/detail-booking/${booking.id}`, { state: { booking } });
};

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input type="text" placeholder="Tìm kiếm ..." className="search-input" />
        </div>
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>Tên khách hàng</th>
            <th>Tổng tiền</th>
            <th>Tên tuyến du lịch</th>
            <th>Ngày đặt</th>
            <th>Số chỗ đặt</th>
            <th>Trạng thái</th>
            <th>View</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.customerName}</td>
              <td>{booking.totalAmount}</td>
              <td>{booking.tourName}</td>
              <td>{booking.bookingDate}</td>
              <td>{booking.seats}</td>
              <td>
                <span className={`status ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                <button className="view-btn" onClick={() => handleView(booking)}>
                  <ViewIcon className="icon-svg" />
                </button>


              </td>
              <td>
                <button className="delete-btn">
                  <DeleteIcon className="icon-svg" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
