import React, { useState, useEffect } from "react";
import "./EmployeePopup.css";
import { ReactComponent as CameraIcon } from "../../../assets/icons/admin/Icon1.svg";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";

const ViewEditEmployeePopup = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

  const handleCancelEdit = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay-emp">
      <div className="popup">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <div className="popup-header">
          <h2>
            {isEditing ? "SỬA THÔNG TIN NHÂN VIÊN" : "XEM THÔNG TIN NHÂN VIÊN"}
          </h2>
          {!isEditing && (
            <button
              type="button"
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon className="icon-svg" />
            </button>
          )}
        </div>

        <div className="popup-body">
          <div className="avatar-emp">
            <input
              type="file"
              accept="image/*"
              id="avatarInput"
              style={{ display: "none" }}
              onChange={handleImageChange}
              disabled={!isEditing}
            />
            <div
              className="avatar-placeholder"
              onClick={() =>
                isEditing && document.getElementById("avatarInput").click()
              }
              style={{ cursor: isEditing ? "pointer" : "default" }}
            >
              {formData.avatar ? (
                <img
                  src={
                    typeof formData.avatar === "string"
                      ? formData.avatar
                      : URL.createObjectURL(formData.avatar)
                  }
                  alt="Avatar"
                  className="avatar-image"
                />
              ) : (
                <CameraIcon className="avatar-camera-icon" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Mã Nhân Viên</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              disabled
            />

            <label>Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <div className="row">
                <div>
                    <label>Giới tính</label>
                    <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    </select>
                </div>

                <div>
                    <label>Ngày sinh</label>
                    <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    />
                </div>
            </div>


            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Tình trạng</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="Đang mở">Đang mở</option>
              <option value="Đã khóa">Đã khóa</option>
            </select>

            <div className="actions">
              {isEditing && (
                <>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="confirm-btn">
                    Lưu
                  </button>
                </>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ViewEditEmployeePopup;
