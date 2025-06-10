import React, { useState } from "react";
import "./AddCustomer.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import { fetchPost, fetchUpload } from "../../../../lib/httpHandler";

export default function AddCustomer({ onCloseAddForm, onAdded }) {
  const [avatar, setAvatar] = useState(null);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    birthday: "",
    address: "",
    sex: true,
    role_id: 1,      // mặc định role_id là 1 (khách hàng)
    account_id: 1,   // bạn có thể cho chọn hoặc mặc định, ở đây mặc định 1
  });
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(file);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Gửi thông tin KH (chưa có avatar)
    fetchPost(
      "/api/admin/customer/create",
      { ...form, avatar: "" },
      (res) => {
        const customer = res.data;
        // 2. Nếu có avatar, upload lên BE
        if (avatar && customer?.id) {
          const formData = new FormData();
          formData.append("file", avatar);
          fetchUpload(
            `/api/admin/customer/update-avatar/${customer.id}`,
            formData,
            (res2) => {
              customer.avatar = res2.data;
              onAdded && onAdded(customer);
              setLoading(false);
              onCloseAddForm();
            },
            () => {
              setLoading(false);
              alert("Lỗi upload ảnh!");
            },
            () => setLoading(false)
          );
        } else {
          onAdded && onAdded(customer);
          setLoading(false);
          onCloseAddForm();
        }
      },
      () => {
        setLoading(false);
        alert("Thêm khách hàng thất bại!");
      },
      () => setLoading(false)
    );
  };

  return (
    <>
      <div className="cus-add-overlay" onClick={onCloseAddForm}></div>
      <form className="cus-add-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h4>Thêm khách hàng</h4>
          <button type="button" className="close-button" onClick={onCloseAddForm}>
            <AiOutlineClose />
          </button>
        </div>
        <div className="form-body">
          <div className="avatar-upload">
            {avatar ? (
              <img
                src={URL.createObjectURL(avatar)}
                alt="avatar"
                className="preview-avatar"
              />
            ) : (
              <label className="upload-icon">
                <AiOutlineCamera />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Giới tính</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="sex"
                    value="true"
                    checked={form.sex === true}
                    onChange={handleChange}
                  />
                  Nam
                </label>
                <label>
                  <input
                    type="radio"
                    name="sex"
                    value="false"
                    checked={form.sex === false}
                    onChange={handleChange}
                  />
                  Nữ
                </label>
              </div>
            </div>
            {/* Nếu muốn cho chọn role/account thì thêm input ở đây */}
          </div>
        </div>
        <div className="form-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={onCloseAddForm}
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" className="confirm-button" disabled={loading}>
            {loading ? "Đang lưu..." : "Xác nhận"}
          </button>
        </div>
      </form>
    </>
  );
}