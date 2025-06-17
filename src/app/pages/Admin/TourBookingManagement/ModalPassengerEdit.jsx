import React, { useState, useEffect } from "react";
import "./ModalPassengerEdit.css";

const ModalPassengerEdit = ({ isOpen, onClose, onUpdate, passenger }) => {
  const [formData, setFormData] = useState(passenger || {});

  useEffect(() => {
    if (passenger) {
      setFormData(passenger);
    }
  }, [passenger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  if (!isOpen || !passenger) return null; // Quan trọng: tránh render khi chưa sẵn sàng

  return (
    <div className="popup-overlay-passenger">
      <div className="popup">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>SỬA THÔNG TIN HÀNH KHÁCH</h2>
        <form onSubmit={handleSubmit}>
          <label>Họ và tên</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
          />

          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
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

export default ModalPassengerEdit;
