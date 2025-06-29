import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetail.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";

import EditCustomerPopup from "./EditCustomerPopup";
import { fetchGet, fetchPut } from "../../../lib/httpHandler";

export default function OrderDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    gender: "",
    birthdate: "",
    email: "",
    address: "",
  });

  useEffect(() => {
  fetchGet(
    `/api/admin/invoice/get/${invoiceId}`,
    (res) => {
      const data = res.data;
      setOrder(data);

      // 🔧 Ưu tiên hiển thị trạng thái "Đã hủy" nếu đơn đã bị hủy
      if (data.isCanceled) {
        setOrderStatus("Đã hủy");
      } else {
        setOrderStatus(data.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán");
      }

      setCustomerData({
        name: data.customerName || "",
        gender: data.user?.sex ? "Nam" : "Nữ" || "",
        birthdate: data.user?.birthday || "",
        email: data.user?.email || "",
        address: data.user?.address || "",
      });
    },
      () => setOrder(null),
      () => alert("Không thể tải thông tin đơn hàng.")
    );
  }, [invoiceId]);


  const handleViewBooking = (booking) => {
    navigate(`/admin/tour-bookings/detail-booking/${booking.id}`, {
      state: { booking },
    });
  };

  const handleCancelOrder = () => {
  const confirmCancel = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");
  if (!confirmCancel) return;

  const updatedInvoice = {
    ...order,
    isCanceled: true,
  };

  fetchPut(
    `/api/admin/invoice/update/${invoiceId}`,
    updatedInvoice,
    (res) => {
      alert("Đơn hàng đã được hủy thành công!");
      setOrderStatus("Đã hủy");
      setOrder((prev) => ({ ...prev, isCanceled: true }));
    },
    () => alert("Không thể hủy đơn hàng"),
    () => alert("Lỗi hệ thống khi hủy đơn hàng")
  );
};


  const handleConfirmPayment = () => {
  if (orderStatus === "Đã hủy") {
    alert("Đơn hàng đã bị hủy. Không thể thanh toán.");
    return;
  }

  const updatedInvoice = {
    ...order,
    paymentStatus: true,
  };

  fetchPut(
    `/api/admin/invoice/update/${order.id}`,
    updatedInvoice,
    (res) => {
      alert("Xác nhận thanh toán thành công!");
      setOrderStatus("Đã thanh toán");
    },
    () => alert("Không thể xác nhận thanh toán"),
    () => alert("Lỗi hệ thống khi xác nhận thanh toán")
  );
  };

  if (!order) {
    return <p>Đang tải thông tin đơn hàng...</p>;
  }

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
              value={
                customerData.birthdate
                  ? new Date(customerData.birthdate).toLocaleDateString("vi-VN")
                  : ""
              }
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
              <input type="text" value={order.id} readOnly />
            </div>
            <div className="form-group">
              <label>Ngày tạo:</label>
              <input
                type="text"
                value={new Date(order.createdAt).toLocaleString("vi-VN")}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Số lượng tour:</label>
              <input
                type="text"
                value={order.tourBookings ? order.tourBookings.length : 0}
                readOnly
              />

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
              <label>Phương thức thanh toán:</label>
              <input type="text" value={order.paymentMethod} readOnly />
            </div>
            <div className="form-group">
              <label>Trạng thái:</label>
              <input type="text" value={orderStatus} readOnly />
            </div>
          </div>
          <div className="confirm-btn-wrapper">
            {orderStatus !== "Đã hủy" && !order.paymentStatus && (
              <button className="confirm-btn" onClick={handleConfirmPayment}>
                Xác nhận thanh toán
              </button>
            )}

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
          {order.tourBookings && order.tourBookings.length > 0 ? (
            order.tourBookings.map((booking, index) => (
              <tr key={index}>
                <td>{booking.tourRoute?.routeName}</td>
                <td>{booking.tourId}</td>
                <td>{new Date(booking.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>{booking.seatsBooked}</td>
                <td>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(booking.totalPrice)}
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => handleViewBooking(booking)}
                  >
                    <ViewIcon className="icon-svg" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Không có phiếu đặt nào.
              </td>
            </tr>
          )}
        </tbody>

        </table>
      </div>

      {orderStatus !== "Đã hủy" && !order.paymentStatus &&(
        <div className="actions">
          <button className="cancel-btn" onClick={handleCancelOrder}>
            Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  );
}
