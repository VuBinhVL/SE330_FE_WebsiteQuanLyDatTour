import React, { useState } from 'react';
import './EmployeePopup.css';
import { ReactComponent as CameraIcon } from "../../../assets/icons/admin/Icon1.svg";

const EmployeePopup = ({ isOpen, onClose, onSubmit }) => {
  const initialForm = {
    name: '',
    gender: '',
    birthdate: '',
    address: '',
    phone: '',
    email: '',
    avatar: null
  };

  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleClose = () => {
    setFormData(initialForm);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay-emp">
      <div className="popup">
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <div className="popup-header">
          <h2>
            THÊM NHÂN VIÊN <span className="plus-icon"></span>
          </h2>
        </div>
        <div className="popup-body">
          <div className="avatar-emp">
            <input
              type="file"
              accept="image/*"
              id="avatarInput"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <div
              className="avatar-placeholder"
              onClick={() => document.getElementById('avatarInput').click()}
              style={{ cursor: 'pointer' }}
            >
              {formData.avatar ? (
                <img
                  src={URL.createObjectURL(formData.avatar)}
                  alt="Avatar"
                  className="avatar-image"
                />
              ) : (
                <CameraIcon className="avatar-camera-icon" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Họ và tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên nhân viên"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div className="row">
              <div>
                <label>Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled hidden>Giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleChange}
            />

            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="actions">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Hủy
              </button>
              <button type="submit" className="confirm-btn">
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeePopup;
