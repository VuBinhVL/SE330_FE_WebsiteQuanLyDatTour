import React, { useEffect, useState } from "react";
import "./EmployeePopup.css";
import { ReactComponent as CameraIcon } from "../../../assets/icons/admin/Icon1.svg";
import { ReactComponent as EditIcon } from "../../../assets/icons/admin/Nút sửa.svg";
import { fetchPost, fetchPut, fetchUpload } from "../../../lib/httpHandler";

const ViewEditEmployeePopup = ({ isOpen, onClose, onSubmit, employeeId }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null); // Ảnh mới chọn

  useEffect(() => {
    if (employeeId && isOpen) {
      fetchPost(
        `/api/admin/staff/get/${employeeId}`,
        null,
        (res) => {
          const emp = res.data;
          const data = {
            id: emp.id,
            fullname: emp.fullname || "",
            sex: emp.sex ? "Nam" : "Nữ",
            birthday: emp.birthday || "",
            phoneNumber: emp.phoneNumber || "",
            email: emp.email || "",
            address: emp.address || "",
            avatar: emp.avatar || "",
            isLock: emp.account?.isLock ? "Đã khóa" : "Đang mở",
            accountId: emp.account?.id,
          };
          setFormData(data);
          setOriginalData(data);
          setAvatar(null); // reset ảnh mới chọn
        },
        () => alert("Không thể tải dữ liệu nhân viên"),
        () => alert("Lỗi hệ thống khi tải nhân viên")
      );
    }
  }, [employeeId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setAvatar(null);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file); // ảnh mới chọn
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToUpdate = {
      fullname: formData.fullname,
      sex: formData.sex === "Nam",
      birthday: formData.birthday,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      avatar: formData.avatar, // đường dẫn cũ, sẽ được cập nhật nếu có ảnh mới
      account: {
        id: formData.accountId,
        isLock: formData.isLock === "Đã khóa",
      },
    };

    fetchPut(
      `/api/admin/staff/update/${formData.id}`,
      dataToUpdate,
      () => {
        // Nếu có chọn ảnh mới thì upload
        if (avatar) {
          const formImg = new FormData();
          formImg.append("file", avatar);
          fetchUpload(
            `/api/admin/staff/update-avatar/${formData.id}`,
            formImg,
            (res2) => {
              setFormData((prev) => ({
                ...prev,
                avatar: res2.data,
              }));
              onSubmit();
              setIsEditing(false);
              onClose();
            },
            () => alert("Không thể cập nhật ảnh"),
            () => alert("Lỗi hệ thống khi cập nhật ảnh")
          );
        } else {
          onSubmit();
          setIsEditing(false);
          onClose();
        }
      },
      () => alert("Không thể cập nhật thông tin nhân viên"),
      () => alert("Lỗi hệ thống khi cập nhật")
    );
  };

  if (!isOpen) return null;

  const avatarPreview = avatar
    ? URL.createObjectURL(avatar)
    : formData.avatar
    ? `http://localhost:8080${formData.avatar}`
    : null;

  return (
    <div className="popup-overlay-emp">
      <div className="popup">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <div className="popup-header">
          <h2>{isEditing ? "SỬA THÔNG TIN NHÂN VIÊN" : "XEM THÔNG TIN NHÂN VIÊN"}</h2>
          {!isEditing && (
            <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
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
              onClick={() => isEditing && document.getElementById("avatarInput").click()}
              style={{ cursor: isEditing ? "pointer" : "default" }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="avatar-image" />
              ) : (
                <CameraIcon className="avatar-camera-icon" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Mã Nhân Viên</label>
            <input type="text" name="id" value={formData.id || ""} disabled />

            <label>Họ và tên</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <div className="row">
              <div>
                <label>Giới tính</label>
                <select
                  name="sex"
                  value={formData.sex || ""}
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
                  name="birthday"
                  value={formData.birthday || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Tình trạng</label>
            <select
              name="isLock"
              value={formData.isLock || ""}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="Đang mở">Đang mở</option>
              <option value="Đã khóa">Đã khóa</option>
            </select>

            <div className="actions">
              {isEditing && (
                <>
                  <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
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
