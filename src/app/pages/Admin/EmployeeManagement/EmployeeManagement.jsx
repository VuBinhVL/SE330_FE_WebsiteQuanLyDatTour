import React, { useState } from "react";
import "./EmployeeManagement.css";
import AddEmployeePopup from "./AddEmployeePopup";
import ViewEditEmployeePopup from "./ViewEditEmployeePopup";
import { ReactComponent as ViewIcon } from "../../../assets/icons/admin/Frame 23.svg";

const initialEmployees = Array.from({ length: 11 }, (_, i) => ({
  id: `NV${(i + 1).toString().padStart(4, "0")}`,
  name: "Nguyễn Văn A",
  gender: "Nam",
  phone: "0987654321",
  email: "employee@gmail.com",
  status: i % 2 === 0 ? "Đang mở" : "Đã khóa",
}));

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

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleAddEmployee = (newEmployee) => {
    const newId = `NV${(employees.length + 1).toString().padStart(4, "0")}`;
    setEmployees([...employees, { ...newEmployee, id: newId, status: "Đang mở" }]);
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
    );
    setSelectedEmployee(null);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="search-container">
          <input type="text" placeholder="Tìm kiếm ..." className="search-input" />
        </div>
        <button className="add-employee-btn" onClick={() => setShowAddPopup(true)}>
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
          {employees.map((emp, index) => (
            <tr key={index}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.gender}</td>
              <td>{emp.phone}</td>
              <td>{emp.email}</td>
              <td>
                <span className={`status ${getStatusClass(emp.status)}`}>
                  {emp.status}
                </span>
              </td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => handleViewEmployee(emp)}
                >
                  <ViewIcon className="icon-svg"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup thêm nhân viên */}
      <AddEmployeePopup
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Popup xem và sửa thông tin nhân viên */}
      {selectedEmployee && (
        <ViewEditEmployeePopup
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSubmit={handleUpdateEmployee}
          initialData={selectedEmployee}
        />
      )}
    </div>
  );
}
