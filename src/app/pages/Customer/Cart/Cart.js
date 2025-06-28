import { useEffect, useState } from "react";
import { MdDelete, MdKeyboardArrowRight } from "react-icons/md";
import { ImQrcode } from "react-icons/im";
import { LuAlarmClock } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { FiUserPlus } from "react-icons/fi";

import UserSidebar from "../../../components/Customer/UserSidebar/UserSidebar";
import "./Cart.css";
import { fetchGet } from "../../../lib/httpHandler";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const userId = localStorage.getItem("userId");
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const total = selected.reduce((sum, id) => {
    const item = cart.find((i) => i.id === id);
    return sum + (item?.price || 0);
  }, 0);

  //Gọi API để lấy giỏ hàng của người dùng
  useEffect(() => {
    const uri = `/api/cart/${userId}`;
    fetchGet(
      uri,
      (res) => {
        setCart(res);
        console.log(res);
      },
      (err) => console.error(err),
      () => console.error("Lỗi kết nối đến máy chủ")
    );
  }, [userId]);
  return (
    <div className="cart-container">
      <UserSidebar />
      <main className="cart-main">
        <h2 className="cart-title">THÔNG TIN GIỎ HÀNG CỦA BẠN</h2>

        <div className="cart-controls">
          <div className="left">
            <input
              type="checkbox"
              checked={selected.length === cart.length}
              onChange={(e) =>
                setSelected(e.target.checked ? cart.map((i) => i.id) : [])
              }
            />
            <span>Chọn tất cả</span>
            <button className="delete-all">Xóa các mục đã chọn</button>
          </div>
          <div className="right">
            <span>
              Tổng cộng ({selected.length} sản phẩm):{" "}
              <strong>{total.toLocaleString()} đ</strong>
            </span>
            <button className="order-btn">
              Đặt ngay <MdKeyboardArrowRight />
            </button>
          </div>
        </div>

        <div className="cart-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-img">
                <input
                  type="checkbox"
                  className="item-check"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
                <img src={item.routeImage} alt="tour" />
              </div>
              <div className="item-info">
                <div className="item-header">
                  <h3>{item.routeName}</h3>
                  <MdDelete className="delete-icon" />
                </div>

                <div className="item-details">
                  <div className="detail-row">
                    <p>
                      <ImQrcode className="icon" /> <span>Mã tour:</span>
                      TOUR{String(item.tourId).padStart(2, "0")}
                    </p>
                    <p>
                      <IoLocationOutline className="icon" />
                      <span>Khởi hành:</span> {item.startLocation}
                    </p>
                  </div>

                  <div className="detail-row">
                    <p>
                      <LuAlarmClock className="icon" /> <span>Thời gian:</span>
                      {item.duration}
                    </p>
                    <p>
                      <IoLocationOutline className="icon" />{" "}
                      <span>Điểm đến:</span>
                      {item.endLocation}
                    </p>
                  </div>

                  <div className="detail-row">
                    <p>
                      <CiCalendar className="icon" />
                      <span>Ngày khởi hành:</span>{" "}
                      {new Date(item.departureDates).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>

                <div className="item-footer">
                  <div className="item-footer-left">
                    <label>Số lượng:</label>
                    <div className="quantity">
                      <button>-</button>
                      <input type="text" value={item.quantity} />
                      <button>+</button>
                    </div>
                    <label className="ticket-label">Vé</label>
                  </div>
                  <div className="item-footer-right">
                    <label>Tổng tiền:</label>
                    <p className="item-price">
                      {(item.price * item.quantity).toLocaleString()} đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
