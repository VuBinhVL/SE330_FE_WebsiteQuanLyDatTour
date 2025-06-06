import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import background from "../../../assets/images/customer/login/background.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={logo} alt="logo" className="logo"></img>
        <h1>Đăng ký tài khoản</h1>

        <div className="register-form">
          <label>Họ và tên</label>
          <input type="text" placeholder="Nhập họ và tên"></input>

          <div className="form-row">
            <div className="form-group">
              <label>Giới tính</label>
              <select>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input type="date"></input>
            </div>
          </div>

          <label>Số điện thoại</label>
          <input type="tel" placeholder="Nhập số điện thoại"></input>

          <label>Email</label>
          <input type="text" placeholder="Nhập email"></input>

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

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
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

          <button className="register-button">Đăng ký</button>

          <div className="login-text">
            Đã có tài khoản? <a href="/login">Đăng nhập</a>
          </div>
        </div>
      </div>

      <div className="register-right">
        <img
          src={background}
          alt="Login background"
          className="background-img"
        />
      </div>
    </div>
  );
}
