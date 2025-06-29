import { useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { ImQrcode } from "react-icons/im";
import { IoLocationOutline } from "react-icons/io5";
import { LuAlarmClock } from "react-icons/lu";
import { MdDelete, MdKeyboardArrowRight } from "react-icons/md";
import { toast } from "react-toastify";
import UserSidebar from "../../../components/Customer/UserSidebar/UserSidebar";
import { fetchDeleteWithBody, fetchGet } from "../../../lib/httpHandler";
import "./Cart.css";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const userId = localStorage.getItem("userId");
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  //Đếm tổng tiền của các mục đã chọn
  const total = selected.reduce((sum, id) => {
    const item = cart.find((i) => i.id === id);
    return sum + (item?.price * item?.quantity || 0);
  }, 0);

  //Gọi API để lấy giỏ hàng của người dùng
  useEffect(() => {
    const uri = `/api/cart/${userId}`;
    fetchGet(
      uri,
      (res) => {
        setCart(res);
      },
      (err) => toast.error(err),
      () => toast.error("Lỗi kết nối đến máy chủ")
    );
  }, [userId]);

  //Hàm xóa
  const handleDeleteCartItems = (ids) => {
    if (!ids || ids.length === 0) {
      toast.error("Không có mục nào được chọn để xóa.");
      return;
    }
    fetchDeleteWithBody(
      "/api/cart/items",
      ids,
      (res) => {
        // Cập nhật lại cart sau khi xóa
        setCart((prev) => prev.filter((item) => !ids.includes(item.id)));
        setSelected((prev) => prev.filter((id) => !ids.includes(id)));
        toast.success(res.message || "Xóa thành công");
      },
      (err) => toast.error("Xóa thất bại:"),
      () => toast.error("Lỗi kết nối máy chủ")
    );
  };

  //Hàm thanh toán
  const handlePayment = (ids) => {
    if (!ids || ids.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 tour để đặt.");
      return;
    }
    const selectedItems = cart.filter((item) => ids.includes(item.id));
    localStorage.setItem("selectedCart", JSON.stringify(selectedItems));
    window.location.href = "/payment";
  };
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
            <button
              className="delete-all"
              onClick={() => handleDeleteCartItems(selected)}
            >
              Xóa các mục đã chọn
            </button>
          </div>
          <div className="right">
            <span>
              Tổng cộng ({selected.length} sản phẩm):{" "}
              <strong>{total.toLocaleString()} đ</strong>
            </span>
            <button
              className="order-btn"
              onClick={() => handlePayment(selected)}
            >
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
                  <MdDelete
                    className="delete-icon"
                    onClick={() => handleDeleteCartItems([item.id])}
                  />
                </div>

                <div className="item-details">
                  <div className="detail-row">
                    <p>
                      <ImQrcode className="icon" /> <span>Mã tour:</span>
                      TOUR{String(item.id).padStart(2, "0")}
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
                      <button
                        onClick={() => {
                          setCart((prev) =>
                            prev.map((p) =>
                              p.id === item.id
                                ? {
                                    ...p,
                                    quantity: Math.max(1, p.quantity - 1),
                                  }
                                : p
                            )
                          );
                        }}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1) {
                            setCart((prev) =>
                              prev.map((p) =>
                                p.id === item.id ? { ...p, quantity: value } : p
                              )
                            );
                          }
                        }}
                      />

                      <button
                        onClick={() => {
                          setCart((prev) =>
                            prev.map((p) =>
                              p.id === item.id
                                ? { ...p, quantity: p.quantity + 1 }
                                : p
                            )
                          );
                        }}
                      >
                        +
                      </button>
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
