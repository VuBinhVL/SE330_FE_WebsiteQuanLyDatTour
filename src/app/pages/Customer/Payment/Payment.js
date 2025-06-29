import React, { useState } from "react";
import "./Payment.css";
import { CiCalendar } from "react-icons/ci";
import { LuAlarmClock } from "react-icons/lu";
import { ImQrcode } from "react-icons/im";
import { IoLocationOutline } from "react-icons/io5";

export default function Payment() {
  const orderItems = [
    {
      id: 1,
      routeName: "Mông cổ",
      quantity: 1,
      image:
        "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcStfJaYNG38SSjcKC3nNJbeePLwNfcgvtcXM7QFk6rsmLTiLbo_CuZN3k0u4K9oJfutnfu3HZvPzW4g5tY4iJDMjfKDU_ajO7RC05pYew",
      tourCode: "DNSG838",
      duration: "5N4Đ",
      departureDate: "01/03",
      startLocation: "TP. Hồ Chí Minh",
      endLocation: "Đà Nẵng",
      totalPrice: 9000,
    },
    {
      id: 2,
      routeName: "Mông cổ",
      quantity: 2,
      image:
        "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcStfJaYNG38SSjcKC3nNJbeePLwNfcgvtcXM7QFk6rsmLTiLbo_CuZN3k0u4K9oJfutnfu3HZvPzW4g5tY4iJDMjfKDU_ajO7RC05pYew",
      tourCode: "DNSG838",
      duration: "5N4Đ",
      departureDate: "01/03",
      startLocation: "TP. Hồ Chí Minh",
      endLocation: "Đà Nẵng",
      totalPrice: 8189000,
    },
    {
      id: 3,
      routeName: "Thanh Hóa - Sầm Sơn",
      quantity: 2,
      image:
        "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcStfJaYNG38SSjcKC3nNJbeePLwNfcgvtcXM7QFk6rsmLTiLbo_CuZN3k0u4K9oJfutnfu3HZvPzW4g5tY4iJDMjfKDU_ajO7RC05pYew",
      tourCode: "DNSG838",
      duration: "5N4Đ",
      departureDate: "01/03",
      startLocation: "TP. Hồ Chí Minh",
      endLocation: "Đà Nẵng",
      totalPrice: 8189000,
    },
  ];

  const [passengerData, setPassengerData] = useState(
    orderItems.map((tour) => ({
      tourId: tour.id,
      routeName: tour.routeName,
      contactIndex: 0, // mặc định chọn người đầu tiên
      passengers: Array.from({ length: tour.quantity }, () => ({
        fullname: "",
        email: "",
        phoneNumber: "",
      })),
    }))
  );

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleChange = (tourIndex, passengerIndex, field, value) => {
    const updated = [...passengerData];
    updated[tourIndex].passengers[passengerIndex][field] = value;
    setPassengerData(updated);
  };

  const handleContactSelect = (tourIndex, passengerIndex) => {
    const updated = [...passengerData];
    updated[tourIndex].contactIndex = passengerIndex;
    setPassengerData(updated);
  };

  return (
    <div className="payment-container">
      <div className="contact-info">
        <h3>Thông tin hành khách</h3>

        {passengerData.map((tour, tourIndex) => (
          <div className="tour-passenger-block" key={tour.tourId}>
            <h4>{tour.routeName}</h4>

            {tour.passengers.map((p, i) => (
              <div className="passenger-section" key={i}>
                <div className="passenger-contact-row">
                  <h5>Hành khách {i + 1}</h5>
                  {tour.passengers.length > 1 && (
                    <label className="contact-radio">
                      <input
                        type="radio"
                        name={`contact-${tourIndex}`}
                        checked={tour.contactIndex === i}
                        onChange={() => handleContactSelect(tourIndex, i)}
                      />
                      Người liên lạc
                    </label>
                  )}
                </div>
                <div className="passenger-info">
                  <div className="input-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      value={p.fullname}
                      onChange={(e) =>
                        handleChange(tourIndex, i, "fullname", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={p.email}
                      onChange={(e) =>
                        handleChange(tourIndex, i, "email", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      value={p.phoneNumber}
                      onChange={(e) =>
                        handleChange(
                          tourIndex,
                          i,
                          "phoneNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="order-info">
        <h3>Thông tin đơn hàng</h3>
        <div className="order-list">
          {orderItems.map((item) => (
            <div className="order-item" key={item.id}>
              <div className="order-image">
                <img src={item.image} alt="Tour" />
              </div>
              <div className="order-details">
                <h4>{item.routeName}</h4>
                <div className="order-row">
                  <p>
                    <ImQrcode className="icon" /> Mã tour:{" "}
                    <b>{item.tourCode}</b>
                  </p>
                  <p>
                    <IoLocationOutline className="icon" /> Khởi hành:{" "}
                    <b>{item.startLocation}</b>
                  </p>
                </div>
                <div className="order-row">
                  <p>
                    <LuAlarmClock className="icon" /> Thời gian:{" "}
                    <b>{item.duration}</b>
                  </p>
                  <p>
                    <IoLocationOutline className="icon" /> Điểm đến:{" "}
                    <b>{item.endLocation}</b>
                  </p>
                </div>
                <div className="order-row">
                  <p>
                    <CiCalendar className="icon" /> Ngày khởi hành:{" "}
                    <span className="departure-date">{item.departureDate}</span>
                  </p>
                </div>
                <p>
                  <b>Số lượng thành viên : {item.quantity}</b>
                </p>
                <div className="order-price">
                  <span>Thành tiền:</span>
                  <b className="total-price">
                    {item.totalPrice.toLocaleString()} đ
                  </b>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="payment-method">
          <h4>Phương thức thanh toán</h4>

          <label>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />
            <span>Tiền mặt</span>
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              value="momo"
              checked={paymentMethod === "momo"}
              onChange={() => setPaymentMethod("momo")}
            />
            <span>Chuyển qua Momo</span>
          </label>
        </div>

        <div className="order-status">
          <div className="status-label">
            <strong>Trạng thái:</strong>
            <button className="status-btn">CHỜ THANH TOÁN</button>
          </div>
          <div className="summary">
            <div className="total-box">
              Tổng thanh toán (3 sản phẩm):{" "}
              <span className="total-price">24.189.000 đ</span>
            </div>
            <div className="action-group">
              <button className="confirm-order">Xác nhận đơn hàng</button>
              <button className="cancel-order">Hủy đơn hàng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
