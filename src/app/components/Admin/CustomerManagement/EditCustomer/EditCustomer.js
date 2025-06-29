import React, { useState, useEffect } from "react";
import "./EditCustomer.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { BE_ENDPOINT, fetchUpload, fetchPut, fetchGet } from "../../../../lib/httpHandler";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function EditCustomer({ customer, onCloseEditForm, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...customer });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);

  const isValidPhone = (phone) => /^\d{10,11}$/.test(phone);
  const isValidEmail = (mail) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mail);

  // Lấy thông tin account khi component mount
  useEffect(() => {
    if (customer.account_id) {
      fetchGet(
        `/api/admin/account/get/${customer.account_id}`,
        (res) => {
          setAccountInfo(res.data);
          setEditForm(prev => ({
            ...prev,
            isLock: res.data.isLock
          }));
        },
        () => {
          console.error("Failed to fetch account info");
        }
      );
    }
  }, [customer.account_id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditForm({ ...customer, isLock: accountInfo?.isLock });
    setAvatarFile(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : 
              name === "isLock" ? value === "true" : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (
      !editForm.fullname ||
      !editForm.email ||
      !editForm.phoneNumber ||
      !editForm.birthday ||
      !editForm.address
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

    // Cập nhật thông tin user trước
    fetchPut(
      `/api/admin/user/update/${customer.id}`,
      {
        ...editForm,
        avatar: customer.avatar,
      },
      (res) => {
        // Cập nhật trạng thái account nếu có thay đổi
        if (accountInfo && editForm.isLock !== accountInfo.isLock) {
          fetchPut(
            `/api/admin/account/update/${customer.account_id}`,
            {
              ...accountInfo,
              isLock: editForm.isLock
            },
            () => {
              // Nếu có avatar mới
              if (avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile);
                fetchUpload(
                  `/api/admin/user/update-avatar/${customer.id}`,
                  formData,
                  (res2) => {
                    setLoading(false);
                    MySwal.fire({
                      icon: "success",
                      title: "Cập nhật thành công!",
                    }).then(() => {
                      onUpdated &&
                        onUpdated({
                          ...editForm,
                          avatar: res2.data,
                          id: customer.id,
                        });
                      onCloseEditForm();
                    });
                  },
                  () => {
                    setLoading(false);
                    MySwal.fire({
                      icon: "error",
                      title: "Lỗi upload ảnh!",
                    });
                  }
                );
              } else {
                setLoading(false);
                MySwal.fire({
                  icon: "success",
                  title: "Cập nhật thành công!",
                }).then(() => {
                  onUpdated &&
                    onUpdated({
                      ...editForm,
                      avatar: customer.avatar,
                      id: customer.id,
                    });
                  onCloseEditForm();
                });
              }
            },
            () => {
              setLoading(false);
              MySwal.fire({
                icon: "error",
                title: "Cập nhật trạng thái tài khoản thất bại!",
              });
            }
          );
        } else {
          // Không có thay đổi account, chỉ xử lý avatar
          if (avatarFile) {
            const formData = new FormData();
            formData.append("file", avatarFile);
            fetchUpload(
              `/api/admin/user/update-avatar/${customer.id}`,
              formData,
              (res2) => {
                setLoading(false);
                MySwal.fire({
                  icon: "success",
                  title: "Cập nhật thành công!",
                }).then(() => {
                  onUpdated &&
                    onUpdated({
                      ...editForm,
                      avatar: res2.data,
                      id: customer.id,
                    });
                  onCloseEditForm();
                });
              },
              () => {
                setLoading(false);
                MySwal.fire({
                  icon: "error",
                  title: "Lỗi upload ảnh!",
                });
              }
            );
          } else {
            setLoading(false);
            MySwal.fire({
              icon: "success",
              title: "Cập nhật thành công!",
            }).then(() => {
              onUpdated &&
                onUpdated({
                  ...editForm,
                  avatar: customer.avatar,
                  id: customer.id,
                });
              onCloseEditForm();
            });
          }
        }
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
      <div className="edit-customer-overlay" onClick={onCloseEditForm}></div>
      <form className="edit-customer-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h4>
            {isEditing ? "Sửa thông tin khách hàng" : "Thông tin khách hàng"}
          </h4>
          <button type="button" className="close-button" onClick={onCloseEditForm}>
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
              <label>Trạng thái tài khoản</label>
              {isEditing ? (
                <select
                  name="isLock"
                  value={editForm.isLock?.toString() || "false"}
                  onChange={handleChange}
                  required
                >
                  <option value="false">Hoạt động</option>
                  <option value="true">Bị khóa</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={editForm.isLock === true || editForm.isLock === "true" ? "Bị khóa" : "Hoạt động"}
                  readOnly
                />
              )}
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