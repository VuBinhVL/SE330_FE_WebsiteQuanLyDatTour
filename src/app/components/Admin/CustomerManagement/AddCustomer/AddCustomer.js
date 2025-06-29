import React, { useState, useEffect, useRef } from "react";
import "./AddCustomer.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { fetchGet, fetchPost, fetchUpload } from "../../../../lib/httpHandler";

const MySwal = withReactContent(Swal);

function randomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function AddCustomer({ onCloseAddForm, onAdded }) {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    birthday: "",
    address: "",
    sex: true,
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canSendMail, setCanSendMail] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailCountdown, setMailCountdown] = useState(30);
  const [createdAccountId, setCreatedAccountId] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);
  const [createdUserMember, setCreatedUserMember] = useState(null);
  const mailTimerRef = useRef();
  const avatarInputRef = useRef();

  // Lấy danh sách account và user để kiểm tra trùng username/email
  useEffect(() => {
    fetchGet("/api/admin/account/get-all", (res) => setAccounts(res.data || []));
    fetchGet("/api/admin/user/get-all", (res) => setUsers(res.data || []));
    return () => clearInterval(mailTimerRef.current);
  }, []);

  // Tạo username random không trùng
  const generateUsername = () => {
    const existingUsernames = accounts.map(acc => acc.username);
    let username;
    let attempts = 0;
    do {
      username = "user" + randomString(6);
      attempts++;
    } while (existingUsernames.includes(username) && attempts < 100);
    return username;
  };

  // Tạo password random
  const generatePassword = () => randomString(8);

  // Validate email format
  const isValidEmail = (mail) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mail);

  // Validate phone
  const isValidPhone = (phone) => /^\d{10,11}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "sex" ? value === "true" : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  // Đếm ngược gửi lại mail
  const startMailCountdown = () => {
    setMailCountdown(30);
    setCanSendMail(false);
    mailTimerRef.current = setInterval(() => {
      setMailCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(mailTimerRef.current);
          setCanSendMail(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Gửi mail tài khoản cho khách hàng
  const handleSendMail = async () => {
    if (!createdAccountId || !createdUser || !createdUserMember) return;
    
    setIsSendingMail(true);
    setCanSendMail(false);
    
    // Gửi mail và chờ kết quả thực tế
    await new Promise((resolve) =>
      fetchPost(
        `/api/admin/account/send-credentials/${createdAccountId}`,
        {},
        () => {
          MySwal.fire({
            icon: "success",
            title: "Đã gửi email thành công!",
            text: "Thông tin tài khoản đã được gửi đến email khách hàng.",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsSendingMail(false);
          startMailCountdown();
          resolve();
        },
        () => {
          MySwal.fire({
            icon: "error", 
            title: "Gửi email thất bại!",
            text: "Vui lòng thử lại sau.",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsSendingMail(false);
          setCanSendMail(true);
          resolve();
        },
        () => {
          MySwal.fire({
            icon: "error",
            title: "Lỗi kết nối!",
            text: "Không thể gửi email. Vui lòng kiểm tra kết nối.",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsSendingMail(false);
          setCanSendMail(true);
          resolve();
        }
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra dữ liệu
    if (
      !form.fullname ||
      !form.email ||
      !form.phoneNumber ||
      !form.birthday ||
      !form.address
    ) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin!",
      });
      return;
    }
    if (!isValidEmail(form.email)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Email không hợp lệ!",
      });
      return;
    }
    if (!isValidPhone(form.phoneNumber)) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Số điện thoại không hợp lệ!",
      });
      return;
    }
    if (users.some((u) => u.email.trim().toLowerCase() === form.email.trim().toLowerCase())) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Email đã được sử dụng!",
      });
      return;
    }

    setLoading(true);

    // 1. Tạo account mới
    const username = generateUsername();
    const password = generatePassword();
    fetchPost(
      "/api/admin/account/create",
      {
        username,
        password,
        isLock: false,
      },
      (accRes) => {
        const accountId = accRes.data.id;
        // 2. Tạo user mới
        fetchPost(
          "/api/admin/user/create",
          {
            ...form,
            account_id: accountId,
            role_id: 1, // role_id cho customer
            avatar: form.avatar || "default.png",
          },
          (userRes) => {
            // 3. Nếu có avatar thì upload
            const afterUserCreated = (userData) => {
              // 4. Tạo user member (nếu có API)
              fetchPost(
                "/api/admin/user-member/create",
                {
                  fullname: userData.fullname,
                  email: userData.email,
                  phoneNumber: userData.phoneNumber,
                  birthday: userData.birthday,
                  address: userData.address,
                  sex: userData.sex,
                  avatar: userData.avatar,
                  userId: userData.id,
                },
                (memberRes) => {
                  setLoading(false);
                  setCreatedAccountId(accountId);
                  setCreatedUser(userData);
                  setCreatedUserMember(memberRes.data);
                  setCanSendMail(true);
                  
                  // Cập nhật danh sách ngay lập tức
                  if (onAdded) onAdded(userData);
                  
                  MySwal.fire({
                    icon: "success",
                    title: "Tạo khách hàng thành công!",
                    text: "Bạn có muốn gửi thông tin tài khoản về email khách hàng không?",
                    showCancelButton: true,
                    confirmButtonText: "Có",
                    cancelButtonText: "Không",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleSendMail();
                      // Không đóng popup, để user có thể gửi lại nếu cần
                    } else {
                      // Chỉ đóng khi user chọn "Không"
                      onCloseAddForm && onCloseAddForm();
                    }
                  });
                },
                () => {
                  setLoading(false);
                  MySwal.fire({
                    icon: "warning",
                    title: "Tạo thành công nhưng tạo user member thất bại!",
                  });
                }
              );
            };

            if (avatarFile) {
              const formData = new FormData();
              formData.append("file", avatarFile);
              fetchUpload(
                `/api/admin/user/update-avatar/${userRes.data.id}`,
                formData,
                (res2) => {
                  afterUserCreated({ ...userRes.data, avatar: res2.data });
                },
                () => {
                  setLoading(false);
                  MySwal.fire({
                    icon: "warning",
                    title: "Tạo thành công nhưng upload avatar thất bại!",
                  });
                }
              );
            } else {
              afterUserCreated(userRes.data);
            }
          },
          () => {
            setLoading(false);
            MySwal.fire({
              icon: "error",
              title: "Lỗi",
              text: "Tạo user thất bại!",
            });
          }
        );
      },
      () => {
        setLoading(false);
        MySwal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Tạo tài khoản thất bại!",
        });
      }
    );
  };

  return (
    <>
      <div 
        className="cus-add-overlay" 
        onClick={isSendingMail ? undefined : onCloseAddForm}
        style={{ cursor: isSendingMail ? 'not-allowed' : 'pointer' }}
      ></div>
      <form className="cus-add-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h4>Thêm khách hàng mới</h4>
          <button 
            type="button" 
            className="close-button" 
            onClick={onCloseAddForm}
            style={{
              opacity: isSendingMail ? 0.6 : 1,
              cursor: isSendingMail ? 'not-allowed' : 'pointer'
            }}
            disabled={isSendingMail}
          >
            <AiOutlineClose />
          </button>
        </div>
        <div className="form-body">
          <div className="avatar-upload">
            {avatarFile ? (
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="avatar"
                className="preview-avatar"
                style={{ 
                  opacity: createdAccountId ? 0.6 : 1,
                  cursor: createdAccountId ? 'not-allowed' : 'pointer'
                }}
              />
            ) : (
              <label className="upload-icon" style={{ 
                opacity: createdAccountId ? 0.6 : 1,
                cursor: createdAccountId ? 'not-allowed' : 'pointer'
              }}>
                <AiOutlineCamera />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                  ref={avatarInputRef}
                  disabled={loading || createdAccountId}
                />
              </label>
            )}
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                required
                disabled={loading || createdAccountId}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading || createdAccountId}
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                maxLength={11}
                disabled={loading || createdAccountId}
              />
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                required
                disabled={loading || createdAccountId}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                disabled={loading || createdAccountId}
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
                    checked={form.sex === true || form.sex === "true"}
                    onChange={handleChange}
                    disabled={loading || createdAccountId}
                  />
                  Nam
                </label>
                <label>
                  <input
                    type="radio"
                    name="sex"
                    value="false"
                    checked={form.sex === false || form.sex === "false"}
                    onChange={handleChange}
                    disabled={loading || createdAccountId}
                  />
                  Nữ
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="form-footer">
          {!createdAccountId && (
            <>
              <button
                type="button"
                className="cancel-button"
                onClick={onCloseAddForm}
                disabled={loading}
              >
                Hủy
              </button>
              <button type="submit" className="confirm-button" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo khách hàng"}
              </button>
            </>
          )}
          {createdAccountId && (
            <button
              type="button"
              className="cancel-button"
              onClick={onCloseAddForm}
              style={{ 
                margin: "0 auto",
                opacity: isSendingMail ? 0.6 : 1,
                cursor: isSendingMail ? 'not-allowed' : 'pointer'
              }}
              disabled={isSendingMail}
            >
              {isSendingMail ? "Đang gửi email..." : "Đóng"}
            </button>
          )}
        </div>
        {createdAccountId && createdUser && createdUserMember && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              type="button"
              className="confirm-button"
              style={{
                background: (canSendMail && !isSendingMail) ? "#c34141" : "#e3bcbc",
                cursor: (canSendMail && !isSendingMail) ? "pointer" : "not-allowed",
                marginTop: 0,
              }}
              onClick={(canSendMail && !isSendingMail) ? handleSendMail : undefined}
              disabled={!canSendMail || isSendingMail}
            >
              {isSendingMail
                ? "Đang gửi email..."
                : canSendMail
                ? "Gửi email tài khoản cho khách hàng"
                : `Gửi lại sau ${mailCountdown}s`}
            </button>
          </div>
        )}
      </form>
    </>
  );
}