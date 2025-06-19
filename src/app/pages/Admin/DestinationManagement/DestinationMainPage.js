import React, { useEffect, useState } from "react";
import "./DestinationMainPage.css";
import search from "../../../assets/icons/customer/header/search.png";
import { MdOutlineAddBox } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import AddDestination from "../../../components/Admin/DestinationManagement/AddDestination/AddDestination";
import DetailDestination from "../../../components/Admin/DestinationManagement/DetailDestination/DetailDestination";
import { fetchGet } from "../../../lib/httpHandler";
import { toast } from "react-toastify";

export default function DestinationMainPage() {
  const [showAddDes, setShowAddDes] = useState(false);
  const [showDetailDes, setShowDetailDes] = useState(false);
  const [destinationList, setDestinationList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  //Lấy danh sách địa điểm từ API
  useEffect(() => {
    const uri = "/api/admin/tourist-attraction";
    fetchGet(
      uri,
      (data) => {
        setDestinationList(data);
        console.log("Danh sách địa điểm:", data);
      },
      (err) => toast.error(err.message),
      () => toast.error("Lỗi kết nối đến máy chủ")
    );
  }, []);

  // Hàm để lọc danh sách địa điểm theo tên
  const filteredDestinations = destinationList.filter((destination) =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const toggleAddDes = () => {
    setShowAddDes(!showAddDes);
  };
  const toggleDetailDes = () => {
    setShowDetailDes(!showDetailDes);
  };

  return (
    <div className="destination-container">
      <div className="top-bar">
        <div className="search-box">
          <img src={search} alt="Icon-Search" className="icon-search" />
          <input
            type="text"
            className="input-search"
            placeholder="Tìm kiếm theo tên địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="add-button"
          title="Thêm địa điểm mới"
          onClick={toggleAddDes}
        >
          <MdOutlineAddBox className="add-icon" />
          Thêm địa điểm
        </button>
      </div>

      <table className="destination-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên địa điểm tham quan</th>
            <th>Vị trí</th>
            <th>Loại địa điểm tham quan</th>
            <th>Xem</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filteredDestinations.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.location}</td>
              <td>{item.categoryName}</td>
              <td>
                <MdOutlineRemoveRedEye
                  className="view-button"
                  title="Xem chi tiết"
                  onClick={toggleDetailDes}
                />
              </td>
              <td>
                <GoTrash className="delete-button" title="Xóa" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Hiển thị popup thêm địa điểm */}
      {showAddDes && <AddDestination onCloseAddForm={toggleAddDes} />}

      {/* Hiển thị popup chi tiết địa điểm */}
      {showDetailDes && <DetailDestination onCloseAddForm={toggleDetailDes} />}
    </div>
  );
}
