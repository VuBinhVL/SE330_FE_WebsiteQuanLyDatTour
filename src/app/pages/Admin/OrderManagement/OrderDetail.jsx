import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderDetail.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";
import { ReactComponent as CoinsHand } from "../../../assets/icons/admin/coins-hand.svg";
import { ReactComponent as Bank } from "../../../assets/icons/admin/bank-note-03.svg";
import { ReactComponent as Wallet } from "../../../assets/icons/admin/wallet-02.svg";
import EditCustomerPopup from "./EditCustomerPopup";

export default function OrderDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order?.status || "");
  const [customerData, setCustomerData] = useState({
    name: order?.customerName || "",
    gender: order?.customerGender || "",
    birthdate: order?.customerBirthdate || "",
    email: order?.customerEmail || "",
    address: order?.customerAddress || "",
  });

  if (!order) {
    return <p>Không có thông tin đơn hàng. Vui lòng quay lại trang quản lý đơn hàng.</p>;
  }

  const handleViewBooking = () => {
    navigate(`/admin/tour-bookings/detail-booking/${order.tourCode}`, {
      state: { booking: order },
    });
  };

  const handleCancelOrder = () => {
    const confirmCancel = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");
    if (confirmCancel) {
      setOrderStatus("Đã hủy");
    }
  };

  const handleConfirmPayment = () => {
    if (orderStatus === "Đã hủy") {
      alert("Đơn hàng đã bị hủy. Không thể thanh toán.");
      return;
    }

    alert("Thanh toán thành công!");
    // Thực hiện xử lý thanh toán thật tại đây nếu cần
  };

  return (
    <div className="order-detail-container">
      {/* Thông tin khách hàng */}
      <div className="customer-info">
        <div className="section-header">
          <h3>Thông tin khách hàng</h3>
          <button className="edit-btn" onClick={() => setIsPopupOpen(true)}>
            <EditIcon className="icon-svg" />
          </button>
        </div>

        <div className="grid-form">
          <div className="form-group">
            <label>Họ và tên:</label>
            <input type="text" value={customerData.name} readOnly />
          </div>
          <div className="form-group">
            <label>Giới tính:</label>
            <input type="text" value={customerData.gender} readOnly />
          </div>
          <div className="form-group">
            <label>Ngày sinh:</label>
            <input
              type="text"
              value={new Date(customerData.birthdate).toLocaleDateString("vi-VN")}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="text" value={customerData.email} readOnly />
          </div>
          <div className="form-group">
            <label>Địa chỉ:</label>
            <input type="text" value={customerData.address} readOnly />
          </div>
        </div>
      </div>

      <EditCustomerPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        initialData={customerData}
        onSubmit={setCustomerData}
      />

      {/* Thông tin đơn hàng */}
      <div className="order-payment-container">
        <div className="order-info">
          <h3>Thông tin đơn hàng</h3>
          <div className="grid-form">
            <div className="form-group">
              <label>Mã đơn hàng:</label>
              <input type="text" value={order.orderCode} readOnly />
            </div>
            <div className="form-group">
              <label>Ngày tạo:</label>
              <input type="text" value={order.orderDate} readOnly />
            </div>
            <div className="form-group">
              <label>Số lượng tour:</label>
              <input type="text" value={order.seats} readOnly />
            </div>
            <div className="form-group">
              <label>Tổng tiền:</label>
              <input
                type="text"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalAmount)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Trạng thái:</label>
              <input type="text" value={orderStatus} readOnly />
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán luôn hiển thị */}
        <div className="payment-method">
          <h3>Chọn phương thức thanh toán</h3>
          <div className="payment-options">
            <label className="payment-option">
              <div className="payment-content">
                <div className="icon">
                  <CoinsHand className="icon-svg" />
                </div>
                <span>Tiền mặt</span>
              </div>
              <input type="radio" name="payment" value="cash" defaultChecked />
            </label>

            <label className="payment-option">
              <div className="payment-content">
                <div className="icon">
                  <Bank className="icon-svg" />
                </div>
                <span>Chuyển khoản</span>
              </div>
              <input type="radio" name="payment" value="bank" />
            </label>

            <label className="payment-option">
              <div className="payment-content">
                <div className="icon">
                  <Wallet className="icon-svg" />
                </div>
                <span>Ví điện tử</span>
              </div>
              <input type="radio" name="payment" value="e-wallet" />
            </label>
          </div>

          <div className="confirm-btn-wrapper">
            <button className="confirm-btn" onClick={handleConfirmPayment}>
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* Phiếu đặt chỗ */}
      <div className="booking-detail-container">
        <h3>Danh sách phiếu đặt chỗ</h3>
        <table className="booking-table">
          <thead>
            <tr>
              <th>Tên tuyến du lịch</th>
              <th>Mã chuyến du lịch</th>
              <th>Ngày đặt</th>
              <th>Số lượng chỗ</th>
              <th>Tổng tiền</th>
              <th>Xem</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{order.tourName}</td>
              <td>{order.tourCode}</td>
              <td>{order.bookingDate}</td>
              <td>{order.seats}</td>
              <td>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalAmount)}
              </td>
              <td>
                <button className="view-btn" onClick={handleViewBooking}>
                  <ViewIcon className="icon-svg" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nút hủy đơn hàng – chỉ hiện nếu chưa bị hủy */}
      {orderStatus !== "Đã hủy" && (
        <div className="actions">
          <button className="cancel-btn" onClick={handleCancelOrder}>
            Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  );
}
