import React, { useState, useRef, useEffect } from "react";
import "./ForgetPassword.css";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import background from "../../../assets/images/customer/login/background.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { fetchPost, fetchGet } from "../../../lib/httpHandler";
import { useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);

export default function ForgetPassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Lấy danh sách account và user khi load trang
  useEffect(() => {
    fetchGet("/api/admin/account/get-all", (res) => setAccounts(res.data || []), () => setAccounts([]));
    fetchGet("/api/admin/user/get-all", (res) => setUsers(res.data || []), () => setUsers([]));
    return () => clearInterval(timerRef.current);
  }, []);

  // Validate email format
  const isValidEmail = (mail) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mail);

  // Đếm ngược 30s để gửi lại
  const startCountdown = () => {
    setCountdown(30);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Gửi lại mail
  const handleResend = () => {
    handleSendMail();
  };

  // Gửi mail đổi mật khẩu
  const handleSendMail = () => {
    if (!username || !email) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin!",
      });
      return;
    }
    if (!isValidEmail(email)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Email không hợp lệ!",
      });
      return;
    }
    // Kiểm tra account và user
    const account = accounts.find((a) => a.username === username);
    if (!account) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Username không tồn tại!",
      });
      return;
    }
    const user = users.find(
      (u) =>
        u.account_id === account.id &&
        u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Email không đúng với tài khoản!",
      });
      return;
    }

    // Hiển thị thành công ngay lập tức, disable nút gửi
    startCountdown();
    MySwal.fire({
      icon: "success",
      title: "Đã gửi email thành công!",
      text: "Vui lòng kiểm tra email của bạn để lấy mật khẩu mới.",
      confirmButtonText: "OK",
    });

    // Gọi API gửi mail ở background
    fetchPost(
      `/api/admin/account/change-password/${account.id}`,
      {},
      () => {},
      () => {}
    );
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-left">
        <img src={logo} alt="logo" className="logo" />
        <h1>Quên mật khẩu</h1>
        <form
          className="forget-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (canResend) handleSendMail();
          }}
        >
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            autoComplete="username"
            disabled={!canResend}
          />
          <label htmlFor="email">Email đăng ký</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email đã đăng ký"
            autoComplete="email"
            type="email"
            disabled={!canResend}
          />
          <button
            type="submit"
            className="email-button"
            disabled={!canResend}
            style={{
              opacity: canResend ? 1 : 0.6,
              cursor: canResend ? "pointer" : "not-allowed",
            }}
          >
            Gửi email đặt lại mật khẩu
          </button>
        </form>
        {!canResend && (
          <div style={{ marginTop: 10 }}>
            <span>
              Bạn chưa nhận được email?{" "}
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="register-link"
                style={{
                  background: "none",
                  border: "none",
                  color: "#c34141",
                  fontWeight: 600,
                  cursor: countdown > 0 ? "not-allowed" : "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại"}
              </button>
            </span>
          </div>
        )}
        <div className="register-text" style={{ marginTop: 18 }}>
          Đã nhớ mật khẩu?{" "}
          <span
            style={{ color: "#c34141", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </span>
        </div>
      </div>
      <div className="forget-password-right">
        <img src={background} alt="background" className="background-img" />
      </div>
    </div>
  );
}