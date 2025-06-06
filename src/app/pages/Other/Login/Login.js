import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import background from "../../../assets/images/customer/login/background.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={logo} alt="logo" className="logo"></img>
        <h1>Đăng nhập</h1>

        <div className="login-form">
          <label>Tên đăng nhập</label>
          <input type="text" placeholder="Nhập tên đăng nhập"></input>

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
            />
            <button
              className="toogle-password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </button>
          </div>

          <div
            className="forgot-link"
            onClick={() => navigate("/forget-password")}
          >
            Quên mật khẩu?
          </div>

          <button className="login-button">Đăng nhập</button>

          <div className="register-text">
            Chưa có tài khoản? <a href="/register">Đăng ký tại đây</a>
          </div>
        </div>
      </div>

      <div className="login-right">
        <img
          src={background}
          alt="Login background"
          className="background-img"
        />
      </div>
    </div>
  );
}
