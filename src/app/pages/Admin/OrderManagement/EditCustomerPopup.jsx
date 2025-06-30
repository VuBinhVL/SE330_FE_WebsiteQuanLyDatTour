import React, { useEffect, useState } from "react";
import "./CustomerPopup.css";
import { fetchGet, fetchPut } from "../../../lib/httpHandler";
import { toast } from "react-toastify";

const EditCustomerPopup = ({ isOpen, onClose, onSubmit, userId }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (userId && isOpen) {
      fetchGet(
        `/api/admin/customer/get/${userId}`,
        (res) => {
          const data = res.data || {};
          setFormData({
            name: data.fullname,
            gender: data.sex ? "Nam" : "Nữ",
            birthdate: data.birthday,
            email: data.email,
            address: data.address,
            phoneNumber: data.phoneNumber,
            avatar: data.avatar || "default.png",
            roleId: data.role?.id || 2,       // giả định role mặc định là 2 (Customer)
            accountId: data.account?.id || 0, // cần lấy accountId đúng từ API
          });
        },
        () => toast.error("Không thể tải thông tin khách hàng."),
        () => toast.error("Lỗi kết nối máy chủ.")
      );
    }
  }, [userId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    // ✅ Payload đầy đủ
    const payload = {
      fullname: formData.name,
      sex: formData.gender === "Nam",
      birthday: formData.birthdate,
      email: formData.email,
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      avatar: formData.avatar || "default.png",
      role: { id: formData.roleId },
      account: { id: formData.accountId },
    };

    fetchPut(
      `/api/admin/customer/update/${userId}`,
      payload,
      () => {
        toast.success("Cập nhật khách hàng thành công!");
        onSubmit();
        onClose();
      },
      () => toast.error("Không thể cập nhật thông tin khách hàng."),
      () => toast.error("Lỗi máy chủ khi cập nhật.")
    );
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay-emp">
      <div className="popup">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>SỬA THÔNG TIN KHÁCH HÀNG</h2>
        <form onSubmit={handleSave} className="popup-form">
          <label>Họ và tên:</label>
          <input type="text" name="name" value={formData.name || ""} onChange={handleChange} required />

          <label>Giới tính:</label>
          <select name="gender" value={formData.gender || ""} onChange={handleChange} required>
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <label>Ngày sinh:</label>
          <input type="date" name="birthdate" value={formData.birthdate || ""} onChange={handleChange} required />

          <label>Email:</label>
          <input type="email" name="email" value={formData.email || ""} onChange={handleChange} required />

          <label>Địa chỉ:</label>
          <input type="text" name="address" value={formData.address || ""} onChange={handleChange} required />

          <label>Số điện thoại:</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} required />

          {/* Avatar và Role ID không cần UI nếu không chỉnh sửa, nhưng vẫn cần gửi đi */}
          {/* Có thể thêm phần chọn ảnh đại diện nếu cần */}

          <div className="actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="confirm-btn">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerPopup;
