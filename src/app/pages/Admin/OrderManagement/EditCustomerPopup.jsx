import React, { useState, useEffect } from "react";
import "./CustomerPopup.css";

const EditCustomerPopup = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay-emp">
      <div className="popup">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>SỬA THÔNG TIN KHÁCH HÀNG</h2>

        <form onSubmit={handleSave} className="popup-form">
          <label>Họ và tên:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
          />

          <label>Giới tính:</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <label>Ngày sinh:</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate || ""}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            required
          />

          <label>Địa chỉ:</label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
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
      </div>
    </div>
  );
};

export default EditCustomerPopup;
