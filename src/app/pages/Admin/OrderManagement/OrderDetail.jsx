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

  const [customerData, setCustomerData] = useState({
    name: "Đặng Phú Thiện",
    gender: "Nam",
    birthdate: "2005-10-17",
    email: "23521476@gm.uit.edu.vn",
    address: "25/17/1, Cửu Long, Phường 2, Tân Bình, Hồ Chí Minh",
  });

   if (!order) {
    return <p>Không có thông tin đơn hàng. Vui lòng quay lại trang quản lý đơn hàng.</p>;
  }


  const bookingDetails = [
    {
      tourName: "Thái Lan: Bangkok - Pattaya (Làng Nong Nooch)",
      tourCode: "HNTL1234",
      departureDate: "17/04/2025",
      seats: 1,
      totalAmount: "8.190.000 đ",
    },
    {
      tourName: "Thái Lan: Bangkok - Pattaya (Làng Nong Nooch)",
      tourCode: "HNTL1234",
      departureDate: "17/04/2025",
      seats: 3,
      totalAmount: "8.190.000 đ",
    },
  ];

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

      {/* Popup sửa thông tin khách hàng */}
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
              <input type="text" value="DNTL233" readOnly />
            </div>
            <div className="form-group">
              <label>Ngày tạo:</label>
              <input type="text" value="04:04:48 17/04/2025" readOnly />
            </div>
            <div className="form-group">
              <label>Số lượng tour:</label>
              <input type="text" value="3" readOnly />
            </div>
            <div className="form-group">
              <label>Tổng tiền:</label>
              <input type="text" value="18.910.900 đ" readOnly />
            </div>
            <div className="form-group">
              <label>Trạng thái:</label>
              <input type="text" value="Chờ thanh toán" readOnly />
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
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
            <button className="confirm-btn">Xác nhận thanh toán</button>
          </div>
        </div>
      </div>

      {/* Danh sách phiếu đặt chỗ */}
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
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {bookingDetails.map((booking, index) => (
              <tr key={index}>
                <td>{booking.tourName}</td>
                <td>{booking.tourCode}</td>
                <td>{booking.departureDate}</td>
                <td>{booking.seats}</td>
                <td>{booking.totalAmount}</td>
                <td>
                  <button className="view-btn">
                    <ViewIcon className="icon-svg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hủy đơn hàng */}
      <div className="actions">
        <button className="cancel-btn">Hủy đơn hàng</button>
      </div>
    </div>
  );
}
