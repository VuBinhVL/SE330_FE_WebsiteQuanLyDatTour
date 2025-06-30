import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./BookingDetail.css";
import ModalPassengerEdit from "./ModalPassengerEdit";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";
import { fetchGet } from "../../../lib/httpHandler";

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  useEffect(() => {
    if (bookingId) {
      // Fetch booking info
      fetchGet(
        `/api/admin/tour-booking/get/${bookingId}`,
        (res) => setBooking(res.data),
        () => setBooking(null),
        () => alert("Không thể tải thông tin booking.")
      );

      // Fetch real passenger details
      fetchGet(
        `/api/admin/tour-booking-detail/get/${bookingId}`,
        (res) => setPassengers(res.data),
        () => setPassengers([]),
        () => alert("Không thể tải danh sách hành khách.")
      );
    }
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="booking-detail-container">
        <h2>Không tìm thấy thông tin phiếu đặt chỗ</h2>
        <button onClick={() => navigate(-1)} className="back-btn">
          ⬅ Quay lại
        </button>
      </div>
    );
  }

  const getStatusText = (status) => {
    return status ? "Đã thanh toán" : "Chưa thanh toán";
  };

  const handleEditPassenger = (passenger) => {
    setSelectedPassenger(passenger);
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setSelectedPassenger(null);
  };

  const handlePassengerUpdate = (updatedPassenger) => {
    console.log("Updated Passenger:", updatedPassenger);
    handlePopupClose();
  };

  return (
    <div className="booking-detail-container">
      <div className="tour-info-card">
        <p className="tour-title"><strong>{booking.tourRoute?.routeName}</strong></p>
        <div className="grid-form">
          <div className="form-group">
            <label>Mã chuyến du lịch:</label>
            <input type="text" value={booking.tourId} readOnly />
          </div>
          <div className="form-group">
            <label>Ngày khởi hành:</label>
            <input
              type="text"
              value={new Date(booking.tour?.depatureDate).toLocaleDateString("vi-VN")}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Ngày trở về:</label>
            <input
              type="text"
              value={new Date(booking.tour?.returnDate).toLocaleDateString("vi-VN")}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Giờ xuất phát:</label>
            <input
              type="text"
              value={new Date(booking.tour?.pickUpTime).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Điểm xuất phát:</label>
            <input type="text" value={booking.tour?.pickUpLocation} readOnly />
          </div>
          <div className="form-group">
            <label>Giá:</label>
            <input
              type="text"
              value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.tour?.price)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Số lượng đặt hành khách:</label>
            <input type="text" value={booking.seatsBooked} readOnly />
          </div>
          <div className="form-group">
            <label>Tổng tiền:</label>
            <input
              type="text"
              value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalPrice)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Trạng thái thanh toán:</label>
            <input
              type="text"
              value={getStatusText(booking.invoice?.paymentStatus === "PAID")}
              readOnly
            />
          </div>
        </div>
      </div>

      <h3>Danh sách hành khách</h3>
      <table className="passenger-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Sửa</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger, index) => (
            <tr key={passenger.id}>
              <td>{index + 1}</td>
              <td>{passenger.userMember?.fullname}</td>
              <td>{passenger.userMember?.phoneNumber}</td>
              <td>{passenger.userMember?.email}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEditPassenger({
                      id: passenger.userMember?.id,
                      name: passenger.userMember?.fullname,
                      phone: passenger.userMember?.phoneNumber,
                      email: passenger.userMember?.email,
                    })
                  }
                >
                  <EditIcon className="icon-svg" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="footer-btns">
        <button
          className="invoice-btn"
          onClick={() => {
            if (booking.invoiceId) {
              navigate(`/admin/invoices/detail/${booking.invoiceId}`, {
                state: { order: booking.invoice },
              });
            } else {
              alert("Không tìm thấy thông tin hóa đơn.");
            }
          }}
        >
          Xem thông tin hóa đơn
        </button>
      </div>

      {isPopupOpen && selectedPassenger && (
        <ModalPassengerEdit
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          onUpdate={handlePassengerUpdate}
          passenger={selectedPassenger}
        />
      )}
    </div>
  );
};

export default BookingDetail;
