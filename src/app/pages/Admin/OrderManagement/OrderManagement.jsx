import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderManagement.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";

const initialOrders = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  customerName: "Đặng Phú Thiện",
  orderCode: "HNT1234",
  orderDate: "04:04:38 - 17/04/2025",
  totalAmount: "8.190.000",
  tourCount: 3,
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

export default function OrderManagement() {
  const [orders] = useState(initialOrders);
  const navigate = useNavigate();

  const handleView = (order) => {
    navigate(`/admin/order-management/detail/${order.id}`, { state: { order } });
  };

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input type="text" placeholder="Tìm kiếm ..." className="search-input" />
        </div>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Tên khách hàng</th>
            <th>Mã đơn hàng</th>
            <th>Ngày tạo</th>
            <th>Số tour</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>View</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.customerName}</td>
              <td>{order.orderCode}</td>
              <td>{order.orderDate}</td>
              <td>{order.tourCount}</td>
              <td>{order.totalAmount} đ</td>
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
