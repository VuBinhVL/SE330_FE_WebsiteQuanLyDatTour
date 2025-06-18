import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BookingDetail.css";
import ModalPassengerEdit from "./ModalPassengerEdit";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";

const BookingDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

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
        <p className="tour-title"><strong>{booking.tourName}</strong></p>
        <div className="grid-form">
          <div className="form-group">
            <label>Mã chuyến du lịch:</label>
            <input type="text" value={booking.tourCode} readOnly />
          </div>
          <div className="form-group">
            <label>Ngày khởi hành:</label>
            <input type="text" value={booking.departureDate} readOnly />
          </div>
          <div className="form-group">
            <label>Ngày trở về:</label>
            <input type="text" value={booking.returnDate} readOnly />
          </div>
          <div className="form-group">
            <label>Giờ xuất phát:</label>
            <input type="text" value={booking.departureTime} readOnly />
          </div>
          <div className="form-group">
            <label>Điểm xuất phát:</label>
            <input type="text" value={booking.departureLocation} readOnly />
          </div>
          <div className="form-group">
            <label>Giá:</label>
            <input
              type="text"
              value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalAmount)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Số lượng đặt hành khách:</label>
            <input type="text" value={booking.seats} readOnly />
          </div>
          <div className="form-group">
            <label>Tổng tiền:</label>
            <input
              type="text"
              value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.paidAmount)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Trạng thái thanh toán:</label>
            <input type="text" value={booking.status} readOnly />
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
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: booking.seats }).map((_, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{`Hành Khách ${index + 1}`}</td>
              <td>{`09000000${index}`}</td>
              <td>{`passenger${index}@mail.com`}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEditPassenger({
                      id: index + 1,
                      name: `Hành Khách ${index + 1}`,
                      phone: `09000000${index}`,
                      email: `passenger${index}@mail.com`,
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
        <button className="invoice-btn">Xem thông tin hóa đơn</button>
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
