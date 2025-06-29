import React, { useEffect, useState } from "react";
import "./EmployeeManagement.css";
import AddEmployeePopup from "./AddEmployeePopup";
import ViewEditEmployeePopup from "./ViewEditEmployeePopup";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";
import { fetchGet } from "../../../lib/httpHandler";

// Hàm chuẩn hóa tìm kiếm – FIXED
const normalize = (str) =>
  (str ?? "") // nếu là null/undefined thì chuyển thành chuỗi rỗng
    .toString() // ép về chuỗi để tránh lỗi khi là số
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();


// Class CSS cho trạng thái
const getStatusClass = (isLock) => {
  return isLock ? "status-locked" : "status-open";
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    fetchGet(
      "/api/admin/staff/get-all",
      (res) => setEmployees(res.data || []),
      () => setEmployees([]),
      () => alert("Có lỗi xảy ra khi tải danh sách nhân viên!")
    );
  };

  const handleAddEmployee = () => {
    fetchEmployees();
    setShowAddPopup(false);
  };

  const handleUpdateEmployee = (data, id) => {
    fetchEmployees();
    setSelectedEmployee(null);
  };

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
            filteredEmployees.map((emp) => {
              const isLocked = emp.account?.isLock === true;
              return (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.fullname}</td>
                  <td>{emp.sex ? "Nam" : "Nữ"}</td>
                  <td>{emp.phoneNumber}</td>
                  <td>{emp.email}</td>
                  <td>
                    {emp.account ? (
                      <span className={`status ${getStatusClass(isLocked)}`}>
                        {isLocked ? "Đã khóa" : "Đang mở"}
                      </span>
                    ) : (
                      <span className="status status-null">Không có</span>
                    )}
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
              );
            })
          )}
        </tbody>
      </table>

      <AddEmployeePopup
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onSubmit={handleAddEmployee}
      />

      {selectedEmployee?.id && (
        <ViewEditEmployeePopup
          isOpen={true}
          onClose={() => setSelectedEmployee(null)}
          onSubmit={handleUpdateEmployee}
          employeeId={selectedEmployee.id}
        />
      )}

    </div>
  );
}
