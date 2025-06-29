import { CiCalendar } from "react-icons/ci";
import { FaReceipt, FaSearch } from "react-icons/fa";
import { ImQrcode } from "react-icons/im";
import "./BookingHistory.css";

import UserSidebar from "../../../components/Customer/UserSidebar";
import { useEffect, useState } from "react";
import { fetchGet } from "../../../lib/httpHandler";

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
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  //Gọi API để lấy danh sách đơn đặt chỗ của người dùng
  useEffect(() => {
    const uri = `/api/invoice/${userId}`;
    fetchGet(
      uri,
      (res) => {
        setData(res);
        console.log(res);
      },
      (err) => console.error(err),
      () => console.error("Lỗi kết nối đến máy chủ")
    );
  }, [userId]);

  return (
    <div className="booking-page-container">
      <UserSidebar />
      <main className="booking-page">
        <h2 className="page-title">THÔNG TIN ĐƠN ĐẶT CHỖ CỦA BẠN</h2>
        <div className="booking-toolbar">
          <div className="search-bar">
            <FaSearch />
            <input
              placeholder="Tìm kiếm mã hóa đơn/ mã tour"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="ĐÃ THANH TOÁN">Đã thanh toán</option>
            <option value="CHƯA THANH TOÁN">Chưa thanh toán</option>
          </select>
        </div>

        <div className="booking-list">
          {data
            .filter((item) => {
              const invoiceIdStr = `HĐ0${item.invoiceId}`.toLowerCase();
              const tourCodeStr = item.tourCodes
                .map((code) => `TOUR${String(code).padStart(2, "0")}`)
                .join(" - ")
                .toLowerCase();

              const matchesSearch =
                invoiceIdStr.includes(searchTerm) ||
                tourCodeStr.includes(searchTerm);

              const statusText = item.paymentStatus
                ? "ĐÃ THANH TOÁN"
                : "CHƯA THANH TOÁN";
              const matchesStatus =
                filterStatus === "Tất cả" || statusText === filterStatus;

              return matchesSearch && matchesStatus;
            })
            .map((item, i) => (
              <div key={i} className="booking-item">
                <img
                  src="https://hnm.1cdn.vn/2024/01/12/images1283642_2.jpg"
                  className="booking-img"
                  alt="tour"
                />
                <div className="booking-content">
                  <div className="booking-info-top">
                    <p>
                      <FaReceipt className="icon" />
                      Mã đơn:
                      <b>HĐ0{item.invoiceId}</b>
                    </p>
                    <p>
                      Số lượng tour : <b>{item.tourCount}</b>
                    </p>
                  </div>
                  <p>
                    <CiCalendar className="icon" /> Ngày tạo:
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </p>
                  <p>
                    <ImQrcode className="icon" /> Mã tour:
                    <b>
                      {item.tourCodes
                        .map((code) => `TOUR${String(code).padStart(2, "0")}`)
                        .join(" - ")}
                    </b>
                  </p>
                </div>
                <div className="booking-price">
                  <span className="price-label">Tổng tiền:</span>
                  <span className="price">
                    {item.totalAmount.toLocaleString()} đ
                  </span>
                  <button
                    className={`status-btn ${getStatusClass(
                      item.paymentStatus ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"
                    )}`}
                  >
                    {item.paymentStatus ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
