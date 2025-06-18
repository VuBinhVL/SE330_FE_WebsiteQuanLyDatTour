import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TourBookingManagement.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";

const initialBookings = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  customerName: `Nguyễn Văn ${i + 1}`,
  phone: `09012345${i}`,
  email: `user${i}@example.com`,
  tourName: "Thái Lan: Bangkok - Pattaya (Làng Nong Nooch)",
  tourCode: `TL2025-${i + 1}`,
  bookingDate: "17/04/2025",
  departureDate: "20/04/2025",
  returnDate: "24/04/2025",
  departureTime: "08:00",
  departureLocation: "Sân bay Tân Sơn Nhất",
  totalAmount: 8190000 * 3,
  paidAmount: i % 3 === 0 ? 8190000 * 3 : i % 3 === 1 ? 0 : 4095000,
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
  const [bookings, setBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleView = (booking) => {
    navigate(`/admin/tour-bookings/detail-booking/${booking.id}`, {
      state: { booking },
    });
  };

  const handleDelete = (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa đơn đặt tour này?");
    if (confirm) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredBookings = bookings.filter((b) =>
    `${b.customerName} ${b.tourName} ${b.phone} ${b.email}`
      .toLowerCase()
      .includes(searchTerm)
  );

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, tour, SĐT, email..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
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
          {filteredBookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.customerName}</td>
              <td>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(booking.totalAmount)}
              </td>
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
                <button className="delete-btn" onClick={() => handleDelete(booking.id)}>
                  <DeleteIcon className="icon-svg" />
                </button>
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                Không tìm thấy đơn đặt tour phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
