import background from "../../../assets/images/customer/login/background.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import "./ForgetPassword.css";
import { useNavigate } from "react-router-dom";

export default function ForgetPassword() {
  const navigate = useNavigate();

  return (
    <div className="forget-password-container">
      <div className="forget-password-left">
        <img src={logo} alt="logo" className="logo"></img>
        <h1>Phần mềm đặt tour</h1>

        <div className="forget-password-form">
          <label>Tên đăng nhập</label>
          <input type="text" placeholder="Nhập tên đăng nhập"></input>

          <label>Email</label>
          <input type="text" placeholder="Nhập email đăng ký "></input>

          <div className="register-link" onClick={() => navigate("/login")}>
            Đăng nhập
          </div>

          <button className="email-button">Gửi mật khẩu qua email</button>

          <div className="register-text">
            Chưa có tài khoản? <a href="/register">Đăng ký tại đây</a>
          </div>
        </div>
      </div>

      <div className="forget-password-right">
        <img
          src={background}
          alt="Login background"
          className="background-img"
        />
      </div>
    </div>
  );
}
