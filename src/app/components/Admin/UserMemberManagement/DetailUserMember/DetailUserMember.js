import React, { useState } from "react";
import "./DetailUserMember.css";
import { AiOutlineClose } from "react-icons/ai";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { fetchPut } from "../../../../lib/httpHandler";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function DetailUserMember({ userMember, onClose, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userMember });
  const [loading, setLoading] = useState(false);

  const isValidPhone = (phone) => /^\d{10,11}$/.test(phone);
  const isValidEmail = (mail) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mail);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditForm({ ...userMember });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (
      !editForm.fullname ||
      !editForm.email ||
      !editForm.phoneNumber ||
      !editForm.birthday
    ) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin!",
      });
      return;
    }
    if (!isValidEmail(editForm.email)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Email không hợp lệ!",
      });
      return;
    }
    if (!isValidPhone(editForm.phoneNumber)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Số điện thoại không hợp lệ!",
      });
      return;
    }
    setLoading(true);
    fetchPut(
      `/api/admin/user-member/update/${userMember.id}`,
      {
        ...editForm,
        userId: userMember.userId, // Không cho chỉnh userId
      },
      (res) => {
        setLoading(false);
        MySwal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
        }).then(() => {
          onUpdated && onUpdated(res.data);
          onClose && onClose();
        });
      },
      () => {
        setLoading(false);
        MySwal.fire({
          icon: "error",
          title: "Cập nhật thất bại!",
        });
      }
    );
  };

  return (
    <>
      <div className="user-member-overlay" onClick={onClose}></div>
      <form className="user-member-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h4>
            {isEditing ? "Sửa thông tin thành viên" : "Thông tin thành viên"}
          </h4>
          <button type="button" className="close-button" onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>

        {!isEditing && (
          <div className="form-edit" onClick={handleEditToggle}>
            <p>Chỉnh sửa</p>
            <button className="edit-button" title="Chỉnh sửa thông tin" type="button">
              <PiPencilSimpleLineBold />
            </button>
          </div>
        )}

        <div className="form-body">
          <div className="form-fields">
            <div className="form-group">
              <label>Họ và tên</label>
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
                maxLength={11}
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
              <label>User ID</label>
              <input
                type="number"
                name="userId"
                value={editForm.userId}
                readOnly
                disabled
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