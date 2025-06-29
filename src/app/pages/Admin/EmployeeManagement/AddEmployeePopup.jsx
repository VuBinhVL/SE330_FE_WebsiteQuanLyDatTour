// AddEmployeePopup.jsx
import React, { useEffect, useRef, useState } from 'react';
import './EmployeePopup.css';
import { ReactComponent as CameraIcon } from "../../../assets/icons/admin/Icon1.svg";
import { fetchPost, fetchUpload, fetchGet } from "../../../lib/httpHandler";
import MySwal from 'sweetalert2';

function randomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// Helper generate string

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

  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [createdAccountId, setCreatedAccountId] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);
  const [canSendMail, setCanSendMail] = useState(false);
  const [mailCountdown, setMailCountdown] = useState(30);
  const mailTimerRef = useRef(null);

  useEffect(() => {
    fetchGet("/api/admin/account/get-all", (res) => setAccounts(res.data || []));
    fetchGet("/api/admin/staff/get-all", (res) => setUsers(res.data || []));
    return () => clearInterval(mailTimerRef.current);
  }, []);

  const generateUsername = () => {
    let username;
    do {
      username = "emp" + randomString(6);
    } while (accounts.some((acc) => acc.username === username));
    return username;
  };

  const generatePassword = () => randomString(8);

  const isValidEmail = (mail) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mail);

  const isValidPhone = (phone) => /^\d{10,11}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'sex' ? value === "Nam" : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const handleClose = () => {
    setForm(initialForm);
    setAvatarFile(null);
    setLoading(false);
    onClose();
  };

  const startMailCountdown = () => {
    setMailCountdown(30);
    setCanSendMail(false);
    mailTimerRef.current = setInterval(() => {
      setMailCountdown(prev => {
        if (prev <= 1) {
          clearInterval(mailTimerRef.current);
          setCanSendMail(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendMail = async () => {
    if (!createdAccountId || !createdUser) return;
    startMailCountdown();
    MySwal.fire({
      icon: "success",
      title: "Đã gửi email thành công!",
      text: "Vui lòng kiểm tra email của nhân viên.",
      confirmButtonText: "OK",
    });
    await new Promise((resolve) =>
      fetchPost(`/api/admin/account/send-credentials/${createdAccountId}`, {}, resolve, resolve)
    );
    onSubmit && onSubmit();
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { fullname, email, phoneNumber, birthday, address } = form;

    if (!fullname || !email || !phoneNumber || !birthday || !address) {
      MySwal.fire({ icon: "error", title: "Thiếu thông tin", text: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }
    if (!isValidEmail(email)) {
      MySwal.fire({ icon: "error", title: "Email không hợp lệ" });
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      MySwal.fire({ icon: "error", title: "Số điện thoại không hợp lệ" });
      return;
    }
    if (users.some((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase())) {
      MySwal.fire({ icon: "error", title: "Email đã tồn tại!" });
      return;
    }

    setLoading(true);
    const username = generateUsername();
    const password = generatePassword();

    fetchPost("/api/admin/account/create", { username, password, isLock: false }, (accRes) => {
      const accountId = accRes.data.id;

      const staffPayload = {
        ...form,
        account_id: accountId,
        avatar: "default.png"
      };

      fetchPost("/api/admin/staff/create", staffPayload, (staffRes) => {
        const staff = staffRes.data;
        const afterCreate = (finalStaff) => {
          setCreatedAccountId(accountId);
          setCreatedUser(finalStaff);
          setCanSendMail(true);
          MySwal.fire({
            icon: "success",
            title: "Tạo nhân viên thành công!",
            text: "Bạn có muốn gửi thông tin tài khoản về email không?",
            showCancelButton: true,
            confirmButtonText: "Gửi email",
            cancelButtonText: "Không",
          }).then((result) => {
            if (result.isConfirmed) handleSendMail();
            else handleClose();
          });
        };

        if (avatarFile) {
          const formImg = new FormData();
          formImg.append("file", avatarFile);
          fetchUpload(`/api/admin/staff/update-avatar/${staff.id}`, formImg, (res2) => {
            afterCreate({ ...staff, avatar: res2.data });
          }, () => {
            setLoading(false);
            MySwal.fire({ icon: "warning", title: "Upload avatar thất bại!" });
          });
        } else {
          afterCreate(staff);
        }

      }, () => {
        setLoading(false);
        MySwal.fire({ icon: "error", title: "Tạo nhân viên thất bại!" });
      });
    }, () => {
      setLoading(false);
      MySwal.fire({ icon: "error", title: "Tạo tài khoản thất bại!" });
    });
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
            <input type="file" accept="image/*" id="avatarInput" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <div className="avatar-placeholder" onClick={() => document.getElementById('avatarInput').click()} style={{ cursor: 'pointer' }}>
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="avatar-image" />
              ) : (
                <CameraIcon className="avatar-camera-icon" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Họ và tên</label>
            <input type="text" name="fullname" value={form.fullname} onChange={handleChange} placeholder="Nhập họ tên" required />

            <div className="row">
              <div>
                <label>Giới tính</label>
                <select name="sex" value={form.sex === true ? "Nam" : form.sex === false ? "Nữ" : ""} onChange={handleChange} required>
                  <option value="" disabled hidden>Giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label>Ngày sinh</label>
                <input type="date" name="birthday" value={form.birthday} onChange={handleChange} required />
              </div>
            </div>

            <label>Địa chỉ</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" required />

            <label>Số điện thoại</label>
            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Số điện thoại" required />

            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" required />

            <div className="actions">
              <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>Hủy</button>
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
