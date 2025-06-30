import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import background from "../../../assets/images/customer/login/background.png";
import logo from "../../../assets/icons/admin/navigation/logo.png";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { fetchPost } from "../../../lib/httpHandler";
import { toast } from "react-toastify";
import { useAuth } from "../../../lib/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    const uri = "/api/auth/login";
    const payload = {
      username,
      password,
    };
    fetchPost(
      uri,
      payload,
      (sus) => {
        if (sus.success) {
          localStorage.setItem("userId", sus.userId);
          setIsLoggedIn(true);
          if (sus.role === "ADMIN" || sus.role === "STAFF") {
            navigate("/admin/dashboard");
          } else if (sus.role === "CUSTOMER") {
            navigate("/");
          }
        } else {
          toast.error(sus.message);
        }
      },
      (err) => toast.error(err.message),
      () => toast.error("Máy chủ mất kết nối")
    );
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={logo} alt="logo" className="logo"></img>
        <h1>Đăng nhập</h1>

        <div className="login-form">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          ></input>

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button className="login-button" onClick={handleLogin}>
            Đăng nhập
          </button>

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
