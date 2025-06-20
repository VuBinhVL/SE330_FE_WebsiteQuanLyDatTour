import React, { useEffect, useState } from "react";
import "./EmployeeManagement.css";
import AddEmployeePopup from "./AddEmployeePopup";
import ViewEditEmployeePopup from "./ViewEditEmployeePopup";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { fetchGet } from "../../../lib/httpHandler";

// Hàm gửi POST JSON
const fetchPostJson = (url, body, onSuccess, onError, onException) => {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then(onSuccess)
    .catch((err) => {
      console.error(err);
      onException();
    });
};

// Hàm xử lý class tình trạng tài khoản
const getStatusClass = (status) => {
  switch (status) {
    case "Đang mở":
      return "status-open";
    case "Đã khóa":
      return "status-locked";
    default:
      return "";
  }
};

// Chuẩn hóa chuỗi tìm kiếm
const normalize = (str) =>
  str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Load danh sách nhân viên
  const fetchEmployees = () => {
    fetchGet(
      "/api/admin/staff/get-all",
      (res) => setEmployees(res.data || []),
      () => setEmployees([]),
      () => alert("Có lỗi xảy ra khi tải danh sách nhân viên!")
    );
  };

  // Thêm nhân viên mới
  const handleAddEmployee = (data) => {
    fetchPostJson(
      "/api/admin/staff/create",
      data,
      () => {
        fetchEmployees();
        setShowAddPopup(false);
      },
      () => alert("Tạo nhân viên thất bại!"),
      () => alert("Có lỗi xảy ra khi tạo nhân viên!")
    );
  };

  // Cập nhật nhân viên
  const handleUpdateEmployee = (data, id) => {
    fetchPostJson(
      `/api/admin/staff/update/${id}`,
      data,
      () => {
        fetchEmployees();
        setSelectedEmployee(null);
      },
      () => alert("Cập nhật nhân viên thất bại!"),
      () => alert("Có lỗi xảy ra khi cập nhật nhân viên!")
    );
  };

  // Lọc tìm kiếm
  const filteredEmployees = employees.filter((emp) =>
    [emp.fullname, emp.id, emp.email].some((field) =>
      normalize(field).includes(normalize(searchTerm))
    )
  );

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm ..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="add-employee-btn"
          onClick={() => setShowAddPopup(true)}
        >
          + Thêm nhân viên
        </button>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Mã Nhân viên</th>
            <th>Họ và tên</th>
            <th>Giới tính</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Tình Trạng</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Không có nhân viên nào.
              </td>
            </tr>
          ) : (
            filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.fullname}</td>
                <td>{emp.sex ? "Nam" : "Nữ"}</td>
                <td>{emp.phoneNumber}</td>
                <td>{emp.email}</td>
                <td>
                  <span
                    className={`status ${getStatusClass(
                      emp.account?.isLock ? "Đã khóa" : "Đang mở"
                    )}`}
                  >
                    {emp.account?.isLock ? "Đã khóa" : "Đang mở"}
                  </span>
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedEmployee(emp)}
                    title="Xem/Sửa nhân viên"
                  >
                    <ViewIcon className="icon-svg" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Popup thêm nhân viên */}
      <AddEmployeePopup
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Popup xem/sửa nhân viên */}
      {selectedEmployee && (
        <ViewEditEmployeePopup
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSubmit={(formData) =>
            handleUpdateEmployee(formData, selectedEmployee.id)
          }
          initialData={selectedEmployee}
        />
      )}
    </div>
  );
}
