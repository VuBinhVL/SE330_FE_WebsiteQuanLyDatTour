import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/admin/Frame 24.svg";
import { fetchGet, fetchDelete } from "../../../lib/httpHandler";
import "./OrderManagement.css";

const getStatusClass = (status) => {
  return status ? "status-paid" : "status-pending";
};

const getStatusText = (status) => {
  return status ? "Đã thanh toán" : "Chưa thanh toán";
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetchGet(
      "/api/admin/invoice/get-all",
      (res) => {
        const transformed = res.data.map((invoice) => ({
          id: invoice.id,
          customerName: invoice.customerName || "Không rõ",
          orderCode: invoice.id,
          orderDate: new Date(invoice.createdAt).toLocaleString("vi-VN"),
          totalAmount: invoice.totalAmount || 0,
          tourCount: invoice.tourCount || 1,
          status: invoice.paymentStatus === true, // chuyển sang kiểu boolean
        }));
        setOrders(transformed);
      },
      () => setOrders([]),
      () => alert("Không thể tải danh sách hóa đơn.")
    );
  };

  const handleView = (order) => {
    navigate(`/admin/invoices/detail/${order.id}`, { state: { order } });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa đơn hàng này không?");
    if (confirmDelete) {
      fetchDelete(
        `/api/admin/invoice/delete/${id}`,
        () => {
          setOrders((prev) => prev.filter((order) => order.id !== id));
        },
        () => {
          alert("Xóa đơn hàng thất bại!");
        },
        () => {
          alert("Có lỗi xảy ra khi kết nối đến máy chủ!");
        }
      );
    }
  };

  const filteredOrders = orders.filter((order) =>
    `${order.customerName} ${order.orderCode} ${getStatusText(order.status)}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã đơn, trạng thái..."
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
                  {getStatusText(order.status)}
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
                Không có đơn hàng nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
