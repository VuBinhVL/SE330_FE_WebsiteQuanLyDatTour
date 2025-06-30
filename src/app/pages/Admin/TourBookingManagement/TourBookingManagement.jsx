import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";
import { fetchGet, fetchDelete } from "../../../lib/httpHandler";
import "./TourBookingManagement.css";
import { AdminTitleContext } from "../../../layouts/adminLayout/AdminLayout/AdminLayout";

// Hàm chuyển đổi trạng thái tour từ int sang chuỗi hiển thị
const getTourStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "Hoạt động";
    case 1:
      return "Đã hủy";
    case 2:
      return "Hết vé";
    case 3:
      return "Hoàn thành";
    default:
      return "Không xác định";
  }
};

export default function TourBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle("Tất cả phiếu đặt tour");
    setSubtitle("Thông tin tất cả phiếu đặt tour");
  }, [setTitle, setSubtitle]);
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    fetchGet(
      "/api/admin/tour-booking/get-all",
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

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa đơn đặt tour này?"
    );
    if (confirmDelete) {
      fetchDelete(
        `/api/admin/tour-booking/delete/${id}`,
        () => {
          setBookings((prev) => prev.filter((b) => b.id !== id));
        },
        () => {
          alert("Xóa đơn đặt tour thất bại!");
        },
        () => {
          alert("Có lỗi xảy ra khi kết nối đến máy chủ!");
        }
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredBookings = bookings.filter((b) =>
    `${b.seatsBooked} ${b.totalPrice} ${b.id}`
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
            <th>Khách hàng</th>
            <th>Tuyến du lịch</th>
            <th>Trạng thái tour</th>
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
              <td>{booking.user?.fullname || "Không có dữ liệu"}</td>
              <td>{booking.tourRoute?.routeName || "Không có dữ liệu"}</td>
              <td>{getTourStatusLabel(booking.tour?.status)}</td>
              <td>{booking.seatsBooked}</td>
              <td>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(booking.totalPrice)}
              </td>
              <td>{booking.createdAt?.split("T")[0]}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => handleView(booking)}
                >
                  <ViewIcon className="icon-svg" />
                </button>
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(booking.id)}
                >
                  <DeleteIcon className="icon-svg" />
                </button>
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                Không tìm thấy đơn đặt tour phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
