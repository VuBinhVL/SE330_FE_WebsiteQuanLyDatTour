import { useEffect, useRef, useState } from "react";
import "./Account.css";
import { fetchPost, fetchPut, fetchUpload, BE_ENDPOINT, fetchGet } from "../../../lib/httpHandler";
import { AiOutlineCamera, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCloseCircle } from "react-icons/ai";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Account() {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);

  const [editInfo, setEditInfo] = useState(false);
  const [editAccount, setEditAccount] = useState(false);

  const [info, setInfo] = useState({
    fullname: "",
    sex: true,
    birthday: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatar: "",
    account_id: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [accountInfo, setAccountInfo] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const avatarInputRef = useRef();

 useEffect(() => {
  if (!userId) return;
  fetchGet(
    `/api/admin/user/get/${userId}`,
    (res) => {
      setUser(res.data);
      setInfo({
        fullname: res.data.fullname || "",
        sex: res.data.sex,
        birthday: res.data.birthday || "",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        address: res.data.address || "",
        avatar: res.data.avatar || "",
        account_id: res.data.account_id,
      });
      setAvatarPreview(
        res.data.avatar
          ? res.data.avatar.startsWith("http")
            ? res.data.avatar
            : BE_ENDPOINT + res.data.avatar
          : "https://via.placeholder.com/120"
      );
      fetchGet(
        `/api/admin/account/get/${res.data.account_id}`,
        (accRes) => {
          setAccount(accRes.data);
          setAccountInfo({
            username: accRes.data.username,
            newPassword: "",
            confirmPassword: "",
          });
        },
        () => MySwal.fire({ icon: "error", title: "Lỗi", text: "Không lấy được thông tin tài khoản" }),
        () => MySwal.fire({ icon: "error", title: "Lỗi", text: "Có lỗi xảy ra khi gọi API tài khoản" })
      );
    },
    () => MySwal.fire({ icon: "error", title: "Lỗi", text: "Không lấy được thông tin user" }),
    () => MySwal.fire({ icon: "error", title: "Lỗi", text: "Có lỗi xảy ra khi gọi API user" })
  );
}, [userId]);

  const handleSaveInfo = async () => {
    if (!info.fullname || !info.email || !info.phoneNumber || !info.birthday || !info.address) {
      MySwal.fire({ icon: "error", title: "Lỗi", text: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    if (!/^\d{10}$/.test(info.phoneNumber)) {
      MySwal.fire({ icon: "error", title: "Lỗi", text: "Số điện thoại phải đủ 10 số" });
      return;
    }
    setLoading(true);
    fetchPut(
      `/api/admin/user/update/${userId}`,
      info,
      (res) => {
        if (avatarFile) {
          const formData = new FormData();
          formData.append("file", avatarFile);
          fetchUpload(
            `/api/admin/user/update-avatar/${userId}`,
            formData,
            (res2) => {
              setUser({ ...res.data, avatar: res2.data });
              setInfo((prev) => ({ ...prev, avatar: res2.data }));
              setAvatarPreview(
                res2.data.startsWith("http") ? res2.data : BE_ENDPOINT + res2.data
              );
              setAvatarFile(null);
              setEditInfo(false);
              setLoading(false);
              
              // Trigger event để cập nhật header ngay lập tức
              window.dispatchEvent(new Event('userInfoUpdated'));
              
              MySwal.fire({
                icon: "success",
                title: "Thành công",
                text: "Cập nhật thông tin thành công",
                timer: 2000,
                showConfirmButton: false,
              });
            },
            () => {
              setLoading(false);
              MySwal.fire({ icon: "error", title: "Lỗi", text: "Lỗi upload ảnh!" });
            }
          );
        } else {
          setUser(res.data);
          setEditInfo(false);
          setLoading(false);
          
          // Trigger event để cập nhật header ngay lập tức
          window.dispatchEvent(new Event('userInfoUpdated'));
          
          MySwal.fire({
            icon: "success",
            title: "Thành công",
            text: "Cập nhật thông tin thành công",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      },
      () => {
        setLoading(false);
        MySwal.fire({ icon: "error", title: "Lỗi", text: "Cập nhật thất bại" });
      }
    );
  };

  // Kiểm tra điều kiện mật khẩu mới
  const passwordValid = (pw) => {
    return pw != null && pw.length >= 6 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  };

  // Xác thực mật khẩu hiện tại bằng SweetAlert2
  const confirmCurrentPassword = async () => {
    let isValid = false;
    let currentPassword = "";
    while (!isValid) {
      const { value: password, isConfirmed, isDismissed } = await MySwal.fire({
        title: "Xác nhận mật khẩu hiện tại",
        input: "password",
        inputLabel: "Nhập mật khẩu hiện tại để xác nhận thay đổi",
        inputPlaceholder: "Nhập mật khẩu hiện tại",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        inputAttributes: {
          autocapitalize: "off",
          autocorrect: "off",
        },
        inputValidator: (value) => {
          if (!value) {
            return "Vui lòng nhập mật khẩu hiện tại";
          }
        },
      });
      if (isDismissed) return null;
      if (isConfirmed) {
        currentPassword = password;
        const result = await new Promise((resolve) => {
          fetchPost(
            `/api/admin/account/verify-password`,
            { accountId: info.account_id, password: currentPassword },
            (res) => resolve(res.data === true),
            () => resolve(false)
          );
        });
        if (result) {
          isValid = true;
        } else {
          await MySwal.fire({
            icon: "error",
            title: "Sai mật khẩu",
            text: "Mật khẩu hiện tại không đúng. Vui lòng thử lại.",
            confirmButtonText: "Thử lại",
          });
        }
      }
    }
    return currentPassword;
  };

  // Sửa tài khoản (username, password)
  const handleSaveAccount = async () => {
    if (!accountInfo.username) {
      MySwal.fire({ icon: "error", title: "Lỗi", text: "Vui lòng nhập tên đăng nhập" });
      return;
    }
    if (!accountInfo.newPassword) {
      MySwal.fire({ icon: "error", title: "Lỗi", text: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (accountInfo.newPassword) {
      if (!passwordValid(accountInfo.newPassword)) {
        MySwal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Mật khẩu mới phải tối thiểu 6 ký tự, gồm chữ cái và số",
        });
        return;
      }
      if (accountInfo.newPassword !== accountInfo.confirmPassword) {
        MySwal.fire({ icon: "error", title: "Lỗi", text: "Mật khẩu mới không khớp" });
        return;
      }
    }
    const currentPassword = await confirmCurrentPassword();
    if (!currentPassword) return;
    setLoading(true);
    fetchPut(
      `/api/admin/account/update/${info.account_id}`,
      {
        id: account.id,
        username: accountInfo.username,
        password: accountInfo.newPassword ? accountInfo.newPassword : account.password,
        isLock: account.isLock,
        currentPassword: currentPassword,
      },
      (res) => {
        setAccount(res.data);
        setEditAccount(false);
        setAccountInfo((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
        setLoading(false);
        MySwal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật tài khoản thành công",
          timer: 2000,
          showConfirmButton: false,
        });
      },
      (err) => {
        setLoading(false);
        MySwal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.message || "Cập nhật tài khoản thất bại",
        });
      }
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      MySwal.fire({ icon: "error", title: "Lỗi", text: "Chỉ chọn file ảnh!" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearNewPassword = () => setAccountInfo((prev) => ({ ...prev, newPassword: "" }));
  const clearConfirmPassword = () => setAccountInfo((prev) => ({ ...prev, confirmPassword: "" }));

  if (!user || !account) return <div>Đang tải...</div>;

  return (
    <div className="account-container">
      <h2 className="account-header-title">Thông tin tài khoản</h2>

      <div className="account-info">
        <div className="info-block">
          <div className="info-block-header">
            <span>Chi tiết thông tin tài khoản</span>
            {!editInfo && (
              <button
                className="icon-btn"
                title="Sửa thông tin"
                onClick={() => setEditInfo(true)}
                type="button"
              >
                <PiPencilSimpleLineBold />
              </button>
            )}
          </div>
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                src={avatarPreview}
                alt="avatar"
                className="avatar-img"
              />
              {editInfo && (
                <button
                  className="avatar-edit-btn"
                  type="button"
                  onClick={() => avatarInputRef.current.click()}
                  title="Đổi ảnh đại diện"
                >
                  <AiOutlineCamera />
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div className="info-section">
            <div className="info-row">
              <div>
                <label>Họ và tên</label>
                <input
                  disabled={!editInfo}
                  value={info.fullname}
                  onChange={(e) =>
                    setInfo({ ...info, fullname: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Giới tính</label>
                <select
                  disabled={!editInfo}
                  value={info.sex === true || info.sex === "true" ? "true" : "false"}
                  onChange={(e) =>
                    setInfo({ ...info, sex: e.target.value === "true" })
                  }
                >
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
              </div>
              <div>
                <label>Ngày sinh</label>
                <input
                  type="date"
                  disabled={!editInfo}
                  value={info.birthday}
                  onChange={(e) =>
                    setInfo({ ...info, birthday: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="info-row">
              <div>
                <label>Email</label>
                <input
                  disabled={!editInfo}
                  value={info.email}
                  onChange={(e) =>
                    setInfo({ ...info, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Số điện thoại</label>
                <input
                  disabled={!editInfo}
                  value={info.phoneNumber}
                  onChange={(e) =>
                    setInfo({ ...info, phoneNumber: e.target.value })
                  }
                  maxLength={10}
                />
              </div>
            </div>
            <div className="info-row">
              <div style={{ width: "100%" }}>
                <label>Địa chỉ</label>
                <input
                  disabled={!editInfo}
                  value={info.address}
                  onChange={(e) =>
                    setInfo({ ...info, address: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="info-actions">
              {editInfo && (
                <>
                  <button
                    onClick={handleSaveInfo}
                    disabled={loading}
                    type="button"
                  >
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    onClick={() => {
                      setEditInfo(false);
                      setInfo({
                        fullname: user.fullname,
                        sex: user.sex,
                        birthday: user.birthday,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        address: user.address,
                        avatar: user.avatar,
                        account_id: user.account_id,
                      });
                      setAvatarFile(null);
                      setAvatarPreview(
                        user.avatar
                          ? user.avatar.startsWith("http")
                            ? user.avatar
                            : BE_ENDPOINT + user.avatar
                          : "https://via.placeholder.com/120"
                      );
                    }}
                    type="button"
                    disabled={loading}
                  >
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="account-section">
        <div className="info-block-header">
          <span>Tên đăng nhập &amp; mật khẩu</span>
          {!editAccount && (
            <button
              className="icon-btn"
              title="Sửa tài khoản"
              onClick={() => setEditAccount(true)}
              type="button"
            >
              <PiPencilSimpleLineBold />
            </button>
          )}
        </div>
        <div className="account-form">
          <div>
            <label>Tên đăng nhập</label>
            <input
              disabled={!editAccount}
              value={accountInfo.username}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, username: e.target.value })
              }
            />
          </div>
          <div className="password-input-group">
            <label>Mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                disabled={!editAccount}
                value={accountInfo.newPassword}
                onChange={(e) =>
                  setAccountInfo({ ...accountInfo, newPassword: e.target.value })
                }
              />
              {editAccount && (
                <>
                  <span
                    className="password-eye"
                    onClick={() => setShowNewPassword((v) => !v)}
                    title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                  {accountInfo.newPassword && (
                    <span
                      className="password-clear"
                      onClick={clearNewPassword}
                      title="Xóa mật khẩu"
                    >
                      <AiOutlineCloseCircle />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="password-input-group">
            <label>Nhập lại mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                disabled={!editAccount}
                value={accountInfo.confirmPassword}
                onChange={(e) =>
                  setAccountInfo({ ...accountInfo, confirmPassword: e.target.value })
                }
              />
              {editAccount && (
                <>
                  <span
                    className="password-eye"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                  {accountInfo.confirmPassword && (
                    <span
                      className="password-clear"
                      onClick={clearConfirmPassword}
                      title="Xóa mật khẩu"
                    >
                      <AiOutlineCloseCircle />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="account-actions">
            {editAccount && (
              <>
                <button
                  onClick={handleSaveAccount}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => {
                    setEditAccount(false);
                    setAccountInfo({
                      username: account.username,
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  type="button"
                  disabled={loading}
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}