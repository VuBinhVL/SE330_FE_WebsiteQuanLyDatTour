import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderManagement.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";

const initialOrders = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  customerName: "Đặng Phú Thiện",
  orderCode: `HNT${1234 + i}`,
  orderDate: "04:04:38 - 17/04/2025",
  totalAmount: 8190000,
  tourCount: 3,
  status: i % 3 === 0 ? "Đã thanh toán" : i % 3 === 1 ? "Đang chờ" : "Đã hủy",
  tourName: "Hà Nội – Tràng An – Bái Đính",
  bookingDate: "17/04/2025",
  seats: 3,
  customerGender: "Nam",
  customerBirthdate: "2005-10-17",
  customerEmail: "23521476@gm.uit.edu.vn",
  customerAddress: "25/17/1, Cửu Long, Phường 2, Tân Bình, Hồ Chí Minh",
  returnDate: "21/04/2025",
  departureTime: "07:00",
  departureLocation: "Sân bay Tân Sơn Nhất",
  tourCode: `HNTL${1234 + i}`,
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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export default function OrderManagement() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleView = (order) => {
    navigate(`/admin/invoices/detail/${order.id}`, { state: { order } });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    }
  };

  const filteredOrders = orders.filter((order) =>
    `${order.customerName} ${order.orderCode} ${order.tourName} ${order.customerEmail} ${order.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã đơn, tour, email, trạng thái..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Tên khách hàng</th>
            <th>Ngày tạo</th>
            <th>Số tour</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Xem</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.orderCode}</td>
              <td>{order.customerName}</td>
              <td>{order.orderDate}</td>
              <td>{order.tourCount}</td>
              <td>{formatCurrency(order.totalAmount)}</td>
              <td>
                <span className={`status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <button className="view-btn" onClick={() => handleView(order)}>
                  <ViewIcon className="icon-svg" />
                </button>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(order.id)}>
                  <DeleteIcon className="icon-svg" />
                </button>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                Không có dữ liệu đơn hàng.
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
