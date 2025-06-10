import React, { useEffect, useState } from "react";
import "./CustomerMainPage.css";
import search from "../../../assets/icons/customer/header/search.png";
import { MdOutlineAddBox } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import AddCustomer from "../../../components/Admin/CustomerManagement/AddCustomer/AddCustomer";
import DetailCustomer from "../../../components/Admin/CustomerManagement/DetailCustomer/DetailCustomer";
import { BE_ENDPOINT, fetchGet, fetchDelete } from "../../../lib/httpHandler";

export default function CustomerMainPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  // Fetch all customers
  useEffect(() => {
    fetchGet(
      "/api/admin/customer/get-all",
      (res) => setCustomers(res.data || []),
      () => setCustomers([]),
      () => setCustomers([])
    );
  }, []);

  // Search filter
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullname?.toLowerCase().includes(searchValue.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      c.phoneNumber?.includes(searchValue)
  );

  const handleShowAdd = () => setShowAdd(!showAdd);

  const handleShowDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedCustomer(null);
    setShowDetail(false);
  };

  const handleUpdateCustomer = (updatedCus) => {
  setCustomers((prev) =>
    prev.map((cus) => (cus.id === updatedCus.id ? updatedCus : cus))
  );
  handleCloseDetail();
};

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
      fetchDelete(
        `/api/admin/customer/delete/${id}`,
        null,
        () => setCustomers((prev) => prev.filter((c) => c.id !== id)),
        () => alert("Xóa thất bại!"),
        () => alert("Có lỗi xảy ra!")
      );
    }
  };

  return (
    <div className="customer-container">
      <div className="top-bar">
        <div className="search-box">
          <img src={search} alt="Icon-Search" className="icon-search" />
          <input
            type="text"
            className="input-search"
            placeholder="Tìm kiếm ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <button
          className="add-button"
          title="Thêm khách hàng mới"
          onClick={handleShowAdd}
        >
          <MdOutlineAddBox className="add-icon" />
          Thêm khách hàng
        </button>
      </div>

      <table className="customer-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th>Giới tính</th>
            <th>Avatar</th>
            <th>Xem</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: "center" }}>
                Không có khách hàng nào.
              </td>
            </tr>
          ) : (
            filteredCustomers.map((cus, idx) => (
              <tr key={cus.id}>
                <td>{idx + 1}</td>
                <td>{cus.fullname}</td>
                <td>{cus.email}</td>
                <td>{cus.phoneNumber}</td>
                <td>{cus.birthday}</td>
                <td>{cus.address}</td>
                <td>{cus.sex ? "Nam" : "Nữ"}</td>
                <td>
                  <img
                    src={cus.avatar?.startsWith("http") ? cus.avatar : BE_ENDPOINT + cus.avatar}
                    alt="avatar"
                    style={{ width: 36, height: 36, borderRadius: "50%" }}
                  />
                </td>
                <td>
                  <MdOutlineRemoveRedEye
                    className="view-button"
                    title="Xem chi tiết"
                    onClick={() => handleShowDetail(cus)}
                  />
                </td>
                <td>
                  <GoTrash
                    className="delete-button"
                    title="Xóa"
                    onClick={() => handleDelete(cus.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
{/* Popup thêm khách hàng */}
      {showAdd && (
        <AddCustomer
          onCloseAddForm={handleShowAdd}
          onAdded={(newCus) => setCustomers((prev) => [...prev, newCus])}
        />
      )}

         {/* Popup chi tiết khách hàng */}
    {showDetail && selectedCustomer && (
  <DetailCustomer
    customer={selectedCustomer}
    onCloseAddForm={handleCloseDetail}
    onUpdated={handleUpdateCustomer}
  />
)}

    </div>
  );
}