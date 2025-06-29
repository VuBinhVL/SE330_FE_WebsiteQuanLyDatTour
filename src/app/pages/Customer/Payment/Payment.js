import React, { useEffect, useState } from "react";
import "./Payment.css";
import { CiCalendar } from "react-icons/ci";
import { LuAlarmClock } from "react-icons/lu";
import { ImQrcode } from "react-icons/im";
import { IoLocationOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { fetchGet, fetchPost } from "../../../lib/httpHandler";

export default function Payment() {
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [userMember, setUserMember] = useState([]);
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [passengerData, setPassengerData] = useState([]);

  // Tính tổng tiền
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

  // Lấy dữ liệu từ localStorage và API user member
  useEffect(() => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    // API: Lấy user members
    const uri = `/api/admin/user-member/user/${userId}`;
    fetchGet(
      uri,
      (res) => setUserMember(res.data),
      (err) => toast.error(err),
      () => toast.error("Lỗi kết nối đến máy chủ")
    );

    // Lấy giỏ hàng
    const data = localStorage.getItem("selectedCart");
    if (data) {
      const items = JSON.parse(data);
      setOrderItems(items);

      setPassengerData(
        items.map((tour) => ({
          tourId: tour.tourId,
          routeName: tour.routeName,
          contactIndex: 0,
          passengers: Array.from({ length: tour.quantity }, () => ({
            fullname: "",
            email: "",
            phoneNumber: "",
            memberId: null,
          })),
        }))
      );
    } else {
      toast.error("Không có dữ liệu giỏ hàng");
    }
  }, [userId]);

  // Kiểm tra nếu dữ liệu hàng khách
  const isPassengerDataValid = () => {
    for (const tour of passengerData) {
      const seen = new Set();

      for (const passenger of tour.passengers) {
        const { fullname, email, phoneNumber } = passenger;

        // Kiểm tra rỗng
        if (!fullname.trim() || !email.trim() || !phoneNumber.trim()) {
          toast.error(
            `Vui lòng nhập đầy đủ thông tin hành khách ở tour "${tour.routeName}"`
          );
          return false;
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast.error(`Email không hợp lệ trong tour "${tour.routeName}"`);
          return false;
        }

        // Kiểm tra số điện thoại hợp lệ
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
          toast.error(
            `Số điện thoại không hợp lệ trong tour "${tour.routeName}"`
          );
          return false;
        }

        // Kiểm tra trùng (dựa trên email + phone)
        const identityKey = `${email
          .trim()
          .toLowerCase()}|${phoneNumber.trim()}`;
        if (seen.has(identityKey)) {
          toast.error(
            `Trong tour "${tour.routeName}" có hành khách bị trùng thông tin.`
          );
          return false;
        }
        seen.add(identityKey);
      }
    }

    return true;
  };

  //Xử lý nhấn nút hủy đơn hàng
  const handleCancelOrder = () => {
    // Xóa dữ liệu giỏ hàng trong localStorage
    localStorage.removeItem("selectedCart");
    // Cập nhật lại state
    setOrderItems([]);
    setPassengerData([]);
    toast.success("Đã hủy đơn hàng", { autoClose: 100 });
    setTimeout(() => {
      window.location.href = "/cart"; // Quay về trang giỏ hàng
    }, 500);
  };

  //Xử lý nhấn nút xác nhận đơn hàng
  const handleConfirmOrder = () => {
    if (orderItems.length === 0) {
      toast.error("Không có sản phẩm nào trong đơn hàng");
      return;
    }

    if (!isPassengerDataValid()) {
      toast.error("Vui lòng điền đầy đủ và hợp lệ thông tin hành khách");
      return;
    }
    setLoading(true);

    const invoicePayload = {
      userId: Number(userId),
      tours: passengerData.map((tour, tourIndex) => ({
        tourId: tour.tourId,
        departureDate:
          orderItems.find((o) => o.tourId === tour.tourId)?.departureDates ||
          "",
        quantity: tour.passengers.length,
        contactIndex: tour.contactIndex,
        passengers: tour.passengers.map((p) => ({
          fullname: p.fullname,
          email: p.email,
          phoneNumber: p.phoneNumber,
        })),
      })),
    };

    fetchPost(
      "/api/invoice/payment-cash",
      invoicePayload,
      (res) => {
        toast.success("Đặt hàng thành công!", { autoClose: 1000 });
        localStorage.removeItem("selectedCart");
        setTimeout(() => {
          setLoading(false);
          window.location.href = "/bookings";
        }, 1000);
      },
      (err) => {
        setLoading(false);
        toast.error(err.message || "Lỗi khi đặt hàng");
      },
      () => {
        toast.error("Lỗi kết nối tới máy chủ");
        setLoading(false);
      }
    );
    // Xóa giỏ hàng sau khi xác nhận
    localStorage.removeItem("selectedCart");
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
                    <label>Chọn thành viên</label>
                    <select
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const member = userMember.find(
                          (m) => m.id.toString() === selectedId
                        );
                        if (member) {
                          handleChange(
                            tourIndex,
                            i,
                            "fullname",
                            member.fullname
                          );
                          handleChange(tourIndex, i, "email", member.email);
                          handleChange(
                            tourIndex,
                            i,
                            "phoneNumber",
                            member.phoneNumber
                          );
                          handleChange(tourIndex, i, "memberId", member.id);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        -- Chọn thành viên --
                      </option>
                      {userMember.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      value={p.fullname}
                      onChange={(e) =>
                        handleChange(tourIndex, i, "fullname", e.target.value)
                      }
                      disabled
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
                      disabled
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
                      disabled
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
                <img src={item.routeImage} alt="Tour" />
              </div>
              <div className="order-details">
                <h4>{item.routeName}</h4>
                <div className="order-row">
                  <p>
                    <ImQrcode className="icon" /> Mã tour:{" "}
                    <b>TOUR{String(item.tourId || item.id).padStart(2, "0")}</b>
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
                    <span className="departure-date">
                      {new Date(item.departureDates).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </p>
                </div>
                <p>
                  <b>Số lượng thành viên : {item.quantity}</b>
                </p>
                <div className="order-price">
                  <span>
                    <b>Thành tiền: </b>
                    {""}
                  </span>
                  <b className="total-price">
                    {(item.price * item.quantity).toLocaleString()} đ
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
          {/* <label>
            <input
              type="radio"
              name="payment"
              value="momo"
              checked={paymentMethod === "momo"}
              onChange={() => setPaymentMethod("momo")}
            />
            <span>Chuyển qua Momo</span>
          </label> */}
        </div>

        <div className="order-status">
          <div className="status-label">
            <strong>Trạng thái:</strong>
            <button className="status-btn">CHỜ THANH TOÁN</button>
          </div>
          <div className="summary">
            <div className="total-box">
              Tổng thanh toán (
              {orderItems.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm):{" "}
              <span className="total-price">
                {totalAmount.toLocaleString()} đ
              </span>
            </div>
            <div className="action-group">
              <button className="confirm-order" onClick={handleConfirmOrder}>
                Xác nhận đơn hàng
              </button>
              <button className="cancel-order" onClick={handleCancelOrder}>
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Đang xử lý đơn hàng...</p>
        </div>
      )}
    </div>
  );
}
