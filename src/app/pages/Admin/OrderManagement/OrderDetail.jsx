import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetail.css";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";

import EditCustomerPopup from "./EditCustomerPopup";
import { fetchGet, fetchPut } from "../../../lib/httpHandler";
import { toast } from "react-toastify";

export default function OrderDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    gender: "",
    birthdate: "",
    email: "",
    address: "",
  });

  const fetchOrder = () => {
    fetchGet(
      `/api/admin/invoice/get/${invoiceId}`,
      (res) => {
        const data = res.data;
        setOrder(data);

        if (data.isCanceled) {
          setOrderStatus("Đã hủy");
        } else {
          setOrderStatus(
            data.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"
          );
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
      () => toast.error("Không thể tải thông tin đơn hàng.")
    );
  };

  useEffect(() => {
    fetchOrder();
  }, [invoiceId]);

  const handleViewBooking = (booking) => {
    navigate(`/admin/tour-bookings/detail-booking/${booking.id}`, {
      state: { booking },
    });
  };

  const handleConfirmPayment = () => {
    if (orderStatus === "Đã hủy") {
      toast.error("Đơn hàng đã bị hủy. Không thể thanh toán.");
      return;
    }

    const updatedInvoice = {
      paymentStatus: true,
    };

    fetchPut(
      `/api/admin/invoice/update/${order.id}`,
      updatedInvoice,
      () => {
        toast.success("Xác nhận thanh toán thành công!");
        setOrderStatus("Đã thanh toán");
        setOrder((prev) => ({ ...prev, paymentStatus: true }));
      },
      () => toast.error("Không thể xác nhận thanh toán"),
      () => toast.error("Lỗi hệ thống khi xác nhận thanh toán")
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
          <button
            className="edit-btn"
            onClick={() => {
              setSelectedCustomerId(order?.user?.id || null);
              setIsPopupOpen(true);
            }}
          >
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
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedCustomerId(null);
        }}
        onSubmit={() => {
          fetchOrder();
          setIsPopupOpen(false);
        }}
        userId={selectedCustomerId}
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
                  <td>
                    {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                  </td>
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
    </div>
  );
}
