import React, { useState } from "react";
import "./DetailCustomer.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { BE_ENDPOINT, fetchUpload, fetchPut } from "../../../../lib/httpHandler";

export default function DetailCustomer({ customer, onCloseAddForm, onUpdated}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...customer });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditForm({ ...customer });
    setAvatarFile(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  setLoading(true);

  fetchPut(
    `/api/admin/customer/update/${customer.id}`,
    {
      ...editForm,
      avatar: customer.avatar,
    },
    (res) => {
      // Nếu có avatar mới
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        fetchUpload(
          `/api/admin/customer/update-avatar/${customer.id}`,
          formData,
          (res2) => {
            setLoading(false);
            // Gọi onUpdated với dữ liệu mới nhất
            onUpdated &&
              onUpdated({
                ...editForm,
                avatar: res2.data,
                id: customer.id,
              });
            onCloseAddForm();
          },
          () => {
            setLoading(false);
            alert("Lỗi upload ảnh!");
          },
          () => setLoading(false)
        );
      } else {
        setLoading(false);
        onUpdated &&
          onUpdated({
            ...editForm,
            avatar: customer.avatar,
            id: customer.id,
          });
        onCloseAddForm();
      }
    },
    () => {
      setLoading(false);
      alert("Cập nhật thất bại!");
    },
    () => setLoading(false)
  );
};

  return (
    <>
      <div className="cus-detail-overlay" onClick={onCloseAddForm}></div>
      <form className="cus-detail-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h4>
            {isEditing ? "Sửa thông tin khách hàng" : "Thông tin khách hàng"}
          </h4>
          <button type="button" className="close-button" onClick={onCloseAddForm}>
            <AiOutlineClose />
          </button>
        </div>

        {!isEditing && (
          <div className="form-edit" onClick={handleEditToggle}>
            <p>Chỉnh sửa</p>
            <button className="edit-button" title="Chỉnh sửa thông tin">
              <PiPencilSimpleLineBold />
            </button>
          </div>
        )}

        <div className="form-body">
          <div className="avatar-upload">
            {isEditing ? (
              avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
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
              )
            ) : (
              <img
                src={
                  customer.avatar?.startsWith("http")
                    ? customer.avatar
                    : BE_ENDPOINT + customer.avatar
                }
                alt="avatar"
                className="preview-avatar"
              />
            )}
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="fullname"
                value={editForm.fullname}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={editForm.phoneNumber}
                onChange={handleChange}
                readOnly={!isEditing}
                required
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                value={editForm.birthday}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={editForm.address}
                onChange={handleChange}
                readOnly={!isEditing}
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
                    checked={editForm.sex === true || editForm.sex === "true"}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  Nam
                </label>
                <label>
                  <input
                    type="radio"
                    name="sex"
                    value="false"
                    checked={editForm.sex === false || editForm.sex === "false"}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  Nữ
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Role ID</label>
              <input
                type="number"
                name="role_id"
                value={editForm.role_id}
                onChange={handleChange}
                readOnly={!isEditing}
                required
                min={1}
              />
            </div>
            <div className="form-group">
              <label>Account ID</label>
              <input
                type="number"
                name="account_id"
                value={editForm.account_id}
                onChange={handleChange}
                readOnly={!isEditing}
                required
                min={1}
              />
            </div>
          </div>
        </div>
        {isEditing && (
          <div className="form-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={handleEditToggle}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="confirm-button" disabled={loading}>
              {loading ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}