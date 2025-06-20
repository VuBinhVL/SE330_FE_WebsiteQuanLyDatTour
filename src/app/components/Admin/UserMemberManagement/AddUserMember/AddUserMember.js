import React, { useState } from "react";
import "./AddUserMember.css";
import { AiOutlineClose } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { fetchPost } from "../../../../lib/httpHandler";

const MySwal = withReactContent(Swal);

export default function AddUserMember({ userId, onClose, onAdded }) {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    birthday: "",
    sex: true,
  });
  const [loading, setLoading] = useState(false);

  // Validate phone
  const isValidPhone = (phone) => /^\d{10,11}$/.test(phone);
  // Validate email
  const isValidEmail = (mail) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mail);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "sex" ? value === "true" : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullname || !form.email || !form.phoneNumber || !form.birthday) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin!",
      });
      return;
    }
    if (!isValidEmail(form.email)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Email không hợp lệ!",
      });
      return;
    }
    if (!isValidPhone(form.phoneNumber)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Số điện thoại không hợp lệ!",
      });
      return;
    }
    setLoading(true);
    fetchPost(
      "/api/admin/user-member/create",
      {
        ...form,
        userId,
      },
      (res) => {
        setLoading(false);
        MySwal.fire({
          icon: "success",
          title: "Thêm thành viên thành công!",
          confirmButtonText: "OK",
        }).then(() => {
          onAdded && onAdded(res.data);
          onClose && onClose();
        });
      },
      () => {
        setLoading(false);
        MySwal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Thêm thành viên thất bại!",
        });
      }
    );
  };

  return (
    <>
      <div className="add-member-overlay" onClick={onClose}></div>
      <form className="add-member-form" onSubmit={handleSubmit}>
        <div className="add-member-header">
          <h4>Thêm thành viên</h4>
          <button type="button" className="close-btn" onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>
        <div className="add-member-body">
          <div className="add-member-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="add-member-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="add-member-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              maxLength={11}
              disabled={loading}
            />
          </div>
          <div className="add-member-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="add-member-group">
            <label>Giới tính</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="sex"
                  value="true"
                  checked={form.sex === true || form.sex === "true"}
                  onChange={handleChange}
                  disabled={loading}
                />
                Nam
              </label>
              <label>
                <input
                  type="radio"
                  name="sex"
                  value="false"
                  checked={form.sex === false || form.sex === "false"}
                  onChange={handleChange}
                  disabled={loading}
                />
                Nữ
              </label>
            </div>
          </div>
        </div>
        <div className="add-member-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" className="confirm-btn" disabled={loading}>
            {loading ? "Đang thêm..." : "Thêm thành viên"}
          </button>
        </div>
      </form>
    </>
  );
}