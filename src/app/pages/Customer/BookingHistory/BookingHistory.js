import { CiCalendar } from "react-icons/ci";
import { FaReceipt, FaSearch } from "react-icons/fa";
import { ImQrcode } from "react-icons/im";
import "./BookingHistory.css";

import UserSidebar from "../../../components/Customer/UserSidebar";

const sampleBookings = [
  {
    id: "DNSG838",
    date: "15/04/2025 04:04:48",
    quantity: 3,
    tour: "DNSG838 - MCSG293 - HNVTJ230",
    total: 8189000,
    status: "ĐÃ THANH TOÁN",
    img: "https://hnm.1cdn.vn/2024/01/12/images1283642_2.jpg",
  },
  {
    id: "DNSG838",
    date: "15/04/2025 04:04:48",
    quantity: 3,
    tour: "DNSG838 - MCSG293 - HNVTJ230",
    total: 8189000,
    status: "ĐÃ THANH TOÁN",
    img: "https://hnm.1cdn.vn/2024/01/12/images1283642_2.jpg",
  },
  {
    id: "DNSG838",
    date: "15/04/2025 04:04:48",
    quantity: 3,
    tour: "DNSG838 - MCSG293 - HNVTJ230",
    total: 8189000,
    status: "CHƯA THANH TOÁN",
    img: "https://hnm.1cdn.vn/2024/01/12/images1283642_2.jpg",
  },
  {
    id: "DNSG838",
    date: "15/04/2025 04:04:48",
    quantity: 3,
    tour: "DNSG838 - MCSG293 - HNVTJ230",
    total: 8189000,
    status: "CHƯA THANH TOÁN",
    img: "https://hnm.1cdn.vn/2024/01/12/images1283642_2.jpg",
  },
];
const getStatusClass = (status) => {
  switch (status) {
    case "CHƯA THANH TOÁN":
      return "pending";
    case "ĐÃ THANH TOÁN":
      return "paid";
    default:
      return "";
  }
};

export default function BookingHistory() {
  return (
    <div className="booking-page-container">
      <UserSidebar />
      <main className="booking-page">
        <h2 className="page-title">THÔNG TIN ĐƠN ĐẶT CHỖ CỦA BẠN</h2>
        <div className="booking-toolbar">
          <div className="search-bar">
            <FaSearch />
            <input placeholder="Tìm kiếm theo tên/mã tour, mã bookings ..." />
          </div>
          <select className="filter-select">
            <option>Tất cả</option>
            <option>Đã thanh toán</option>
            <option>Chưa thanh toán</option>
          </select>
        </div>

        <div className="booking-list">
          {sampleBookings.map((item, i) => (
            <div key={i} className="booking-item">
              <img src={item.img} className="booking-img" alt="tour" />
              <div className="booking-content">
                <div className="booking-info-top">
                  <p>
                    <FaReceipt className="icon" /> Mã đơn: <b>{item.id}</b>
                  </p>
                  <p>
                    Số lượng tour : <b>{item.quantity}</b>
                  </p>
                </div>
                <p>
                  <CiCalendar className="icon" /> Ngày tạo:{" "}
                  <span>{item.date}</span>
                </p>
                <p>
                  <ImQrcode className="icon" /> Mã tour: <b>{item.tour}</b>
                </p>
              </div>
              <div className="booking-price">
                <span className="price-label">Tổng tiền:</span>
                <span className="price">{item.total.toLocaleString()} đ</span>
                <button className={`status-btn ${getStatusClass(item.status)}`}>
                  {item.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
