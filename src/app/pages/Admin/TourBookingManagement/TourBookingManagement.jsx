import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";
import { fetchGet } from "../../../lib/httpHandler";
import "./TourBookingManagement.css";

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
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    fetchGet(
      "/api/admin/tour-booking",
      (res) => setBookings(res.data || []),
      () => setBookings([]),
      () => alert("Có lỗi xảy ra khi tải danh sách đơn đặt tour!")
    );
  };

  const handleView = (booking) => {
    navigate(`/admin/tour-bookings/detail-booking/${booking.id}`, {
      state: { booking },
    });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa đơn đặt tour này?");
    if (confirm) {
      try {
        const res = await fetch(`/api/admin/tour-booking/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa booking:", error);
        alert("Xóa thất bại!");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredBookings = bookings.filter((b) =>
    `${b.seatsBooked} ${b.totalPrice} ${b.id}`
      .toString()
      .toLowerCase()
      .includes(searchTerm)
  );

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, số chỗ, giá..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Số chỗ đặt</th>
            <th>Tổng tiền</th>
            <th>Ngày tạo</th>
            <th>View</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.seatsBooked}</td>
              <td>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(booking.totalPrice)}
              </td>
              <td>{booking.createdAt?.split("T")[0]}</td>
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
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                Không tìm thấy đơn đặt tour phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
