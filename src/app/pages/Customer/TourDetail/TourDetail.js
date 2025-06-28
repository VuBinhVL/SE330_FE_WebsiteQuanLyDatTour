// TourDetail.js
import { useState } from "react";
import { CiCalendar } from "react-icons/ci";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCartPlus,
  FaHeart,
  FaUser,
} from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuAlarmClockCheck, LuTicketCheck } from "react-icons/lu";
import "./TourDetail.css";

const TourDetail = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [itineraryPage, setItineraryPage] = useState(0);

  const images = [
    "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcT2ziQ7eoHcX8BPXfDX4TMViQwBiovNriw8zviO9TrrVxJ1tbgjNTX7dRGxkTWkj5DPn-GiT7lydv56c98n8EHmXVhHAfjdJdNDFtcNEDM",
    "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nry5sKcnSck_TOz7ghdgZXtHqb0b2z4fAip922aB4ISKZnhSZhzVJuuNFKiqW2y3NKhi1TWyQb9jNo0fv7Fz2RB0AErJ9kmjFYO8efxi63lQgmSkF2UOGgHujYGpP9PUfXn18sJkw=w810-h468-n-k-no",
    "https://bizweb.dktcdn.net/100/474/438/products/tramy1206-232616012640-di-chuyen-di-lai-thai-lan-2.jpg?v=1714615748083",
  ];

  const itinerary = [
    {
      day: "Ngày 1",
      events: [
        { icon: "✈️", name: "Sân bay Tân Sơn Nhất", tag: "Sân bay" },
        { icon: "🌊", name: "Sông Chao Phraya", tag: "Sông suối" },
        { icon: "🏨", name: "Khách sạn Bangkok", tag: "Khách sạn" },
        { icon: "🏨", name: "Khách sạn Bangkok", tag: "Khách sạn" },
      ],
    },
    {
      day: "Ngày 2",
      events: [
        { icon: "🏯", name: "Cung điện hoàng gia", tag: "Di tích lịch sử" },
        { icon: "🏖️", name: "Biển Pattaya", tag: "Bãi biển" },
        { icon: "🏕️", name: "Làng Nong Nooch", tag: "Làng nghề" },
        { icon: "🏨", name: "Khách sạn Bangkok", tag: "Khách sạn" },
      ],
    },
    {
      day: "Ngày 3",
      events: [
        { icon: "🏯", name: "Cung điện hoàng gia", tag: "Di tích lịch sử" },
        { icon: "🏖️", name: "Biển Pattaya", tag: "Bãi biển" },
        { icon: "🏕️", name: "Làng Nong Nooch", tag: "Làng nghề" },
        { icon: "🏨", name: "Khách sạn Bangkok", tag: "Khách sạn" },
      ],
    },
    {
      day: "Ngày 4",
      events: [
        { icon: "🛕", name: "Chùa Vàng", tag: "Tôn giáo" },
        { icon: "🛍️", name: "Chợ nổi", tag: "Mua sắm" },
      ],
    },
  ];

  const totalPages = Math.ceil(itinerary.length / 3);

  const handlePrev = () => {
    setItineraryPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setItineraryPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div className="tour-detail-container">
      <h2 className="tour-title">
        Thái Lan: Bangkok – Pattaya (Chợ nổi Bốn Miền, chùa Phật Lớn, Khu du
        lịch Suan Thai Pattaya...)
      </h2>

      <div className="tour-main">
        <div className="tour-image">
          <img src={images[currentImage]} alt="Tour" />
          <button
            className="image-nav left"
            onClick={() =>
              setCurrentImage(
                (currentImage - 1 + images.length) % images.length
              )
            }
          >
            <FaArrowLeft />
          </button>
          <button
            className="image-nav right"
            onClick={() => setCurrentImage((currentImage + 1) % images.length)}
          >
            <FaArrowRight />
          </button>
          <div className="heart-icon">
            <FaHeart />
          </div>
        </div>

        <div className="booking-panel">
          <h3>ĐẶT VÉ</h3>
          <div className="booking-field">
            <label>Ngày đi:</label>
            <input type="date" />
          </div>
          <div className="booking-field">
            <label>Giá vé:</label>
            <span className="price">8.189.000 đ / Khách</span>
          </div>
          <div className="booking-field">
            <label>Số lượng:</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </button>
              <span>
                <strong>{quantity}</strong> người
              </span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>
          <div className="booking-field">
            <label>Tổng tiền:</label>
            <div className="booking-total">
              {(8189000 * quantity).toLocaleString()} đ
            </div>
          </div>

          <div className="booking-actions">
            <button className="btn-cart">
              <FaCartPlus /> Thêm
            </button>
            <button className="btn-order">Đặt ngay ➜</button>
          </div>

          <button className="btn-passenger">
            <FaUser /> Nhập thông tin hành khách
          </button>

          <div className="trip-info">
            <hr />
            <h6>
              <strong>THÔNG TIN VỀ CHUYẾN ĐI</strong>
            </h6>
            <p>
              <IoLocationOutline className="icon" /> Khởi hành:
              <b>TP. Hồ Chí Minh</b>
            </p>
            <p>
              <IoLocationOutline className="icon" /> Điểm đến: <b>Đà Nẵng</b>
            </p>
            <p>
              <LuAlarmClockCheck /> Thời gian: <b>5N4Đ</b>
            </p>
            <p>
              <CiCalendar /> Ngày kết thúc: <b>T6, 18 tháng 4, 2025</b>
            </p>
            <p>
              <LuTicketCheck /> Số chỗ còn trống: <b>41</b>
            </p>
            <p>
              <IoLocationOutline className="icon" /> Điểm xuất phát:{" "}
              <b>Sân bay Tân Sơn Nhất</b>
            </p>
            <p>
              <LuAlarmClockCheck /> Giờ xuất phát: <b>15:05</b>
            </p>
          </div>
        </div>
      </div>

      <div className="itinerary-section">
        <div className="itinerary-title">LỊCH TRÌNH</div>
        <div className="itinerary-controls">
          <button onClick={handlePrev}>
            <FaArrowLeft />
          </button>
          <button onClick={handleNext}>
            <FaArrowRight />
          </button>
        </div>

        <div className="itinerary-slider">
          {itinerary
            .slice(itineraryPage * 3, itineraryPage * 3 + 3)
            .map((day, index) => (
              <div className="day-column" key={index}>
                <h4>* {day.day}</h4>
                <ul>
                  {day.events.map((event, idx) => (
                    <li key={idx}>
                      <span className="icon">{event.icon}</span>
                      {event.name}
                      <span className="tag">{event.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
