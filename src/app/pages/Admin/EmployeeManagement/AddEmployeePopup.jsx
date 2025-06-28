import React, { useState } from 'react';
import './EmployeePopup.css';
import { ReactComponent as CameraIcon } from "../../../assets/icons/admin/Icon1.svg";
import { fetchPost, fetchUpload } from "../../../lib/httpHandler";

const AddEmployeePopup = ({ isOpen, onClose, onSubmit }) => {
  const initialForm = {
    fullname: '',
    sex: '',
    birthday: '',
    address: '',
    phoneNumber: '',
    email: '',
    role_id: 3,
    account_id: null,
  };

  const [formData, setFormData] = useState(initialForm);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sex') {
      setFormData(prev => ({ ...prev, sex: value === 'Nam' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleClose = () => {
    setFormData(initialForm);
    setAvatar(null);
    onClose();
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.fullname || formData.sex === '' || !formData.username || !formData.password) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
    return;
  }

  if (new Date(formData.birthday) > new Date()) {
    alert("Ngày sinh không hợp lệ!");
    return;
  }

  setLoading(true);

  const accountPayload = {
    username: formData.username,
    password: formData.password,
    isLock: false
  };

  fetchPost(
    "/api/admin/account/create",
    accountPayload,
    (accRes) => {
      const accountId = accRes.data?.id;
      if (!accountId) {
        alert("Không lấy được account_id");
        setLoading(false);
        return;
      }

      const staffPayload = {
        ...formData,
        account_id: accountId,
        avatar: ""
      };

      fetchPost(
        "/api/admin/staff/create",
        staffPayload,
        (res) => {
          const staff = res.data;

          if (avatar && staff?.id) {
            const formImg = new FormData();
            formImg.append("file", avatar);

            fetchUpload(
              `/api/admin/staff/update-avatar/${staff.id}`,
              formImg,
              (res2) => {
                staff.avatar = res2.data;
                onSubmit && onSubmit();
                handleClose();
                setLoading(false);
              },
              () => {
                alert("Lỗi upload ảnh!");
                setLoading(false);
              },
              () => {}
            );
          } else {
            onSubmit && onSubmit();
            handleClose();
            setLoading(false);
          }
        },
        () => {
          alert("Đã xảy ra lỗi khi thêm nhân viên!");
          setLoading(false);
        },
        () => {}
      );
    },
    () => {
      alert("Tạo tài khoản thất bại");
      setLoading(false);
    },
    () => {}
  );
};


  if (!isOpen) return null;

  return (
    <div className="popup-overlay-emp">
      <div className="popup">
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <div className="popup-header">
          <h2>THÊM NHÂN VIÊN</h2>
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
              {avatar ? (
                <img
                  src={URL.createObjectURL(avatar)}
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
              name="fullname"
              placeholder="Nhập họ tên nhân viên"
              value={formData.fullname}
              onChange={handleChange}
              required
            />

            <div className="row">
              <div>
                <label>Giới tính</label>
                <select
                  name="sex"
                  value={formData.sex === true ? "Nam" : formData.sex === false ? "Nữ" : ""}
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
                  name="birthday"
                  value={formData.birthday}
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
              name="phoneNumber"
              placeholder="Số điện thoại"
              value={formData.phoneNumber}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="actions">
              <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
                Hủy
              </button>
              <button type="submit" className="confirm-btn" disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePopup;
