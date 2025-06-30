import React, { useState, useEffect } from "react";
import { fetchGet, fetchPut } from "../../../lib/httpHandler";
import "./ModalPassengerEdit.css";

const ModalPassengerEdit = ({ isOpen, onClose, onUpdate, passenger }) => {
  const [formData, setFormData] = useState({
    id: "",
    fullname: "",
    phoneNumber: "",
    email: "",
    birthday: "",
    sex: "",
    userId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && passenger?.id) {
      setLoading(true);
      fetchGet(
        `/api/admin/user-member/get/${passenger.id}`,
        (res) => {
          const data = res.data;
          setFormData({
            id: data.id || "",
            fullname: data.fullname || "",
            phoneNumber: data.phoneNumber || "",
            email: data.email || "",
            birthday: data.birthday || "",
            sex: data.sex !== null && data.sex !== undefined ? String(data.sex) : "",
            userId: data.userId || "",
          });
          setLoading(false);
        },
        () => {
          alert("Không thể tải thông tin hành khách.");
          setLoading(false);
        },
        () => {
          alert("Lỗi kết nối đến server.");
          setLoading(false);
        }
      );
    }
  }, [isOpen, passenger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      fullname: formData.fullname,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      birthday: formData.birthday,
      sex: formData.sex === "true",
      userId: formData.userId,
    };

    fetchPut(
      `/api/admin/user-member/update/${formData.id}`,
      payload,
      (res) => {
        alert("Cập nhật hành khách thành công!");
        onUpdate(res.data);
        onClose();
      },
      () => {
        alert("Cập nhật thất bại.");
      },
      () => {
        alert("Lỗi kết nối đến server.");
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay-passenger">
      <div className="popup">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>SỬA THÔNG TIN HÀNH KHÁCH</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <form onSubmit={handleSubmit}>

            <label>Họ và tên</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
            
            <div className="row-group">
              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giới tính</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
              </div>
            </div>


            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="confirm-btn">
                Lưu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalPassengerEdit;
