import React, { useState } from "react";
import "./DestinationMainPage.css";
import search from "../../../assets/icons/customer/header/search.png";
import { MdOutlineAddBox } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import AddDestination from "../../../components/Admin/DestinationManagement/AddDestination/AddDestination";

export default function DestinationMainPage() {
  const [showAddDes, setShowAddDes] = useState(false);
  const [showDetailDes, setShowDetailDes] = useState(false);

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
            placeholder="Tìm kiếm ..."
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
          <tr>
            <td>1</td>
            <td>Vườn hoa Campuchiha</td>
            <td>Xapmual</td>
            <td>Cảnh quan du lich</td>
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
        </tbody>
      </table>
      {/* Hiển thị popup thêm địa điểm */}
      {showAddDes && <AddDestination onCloseAddForm={toggleAddDes} />}

      {/* Hiển thị popup chi tiết địa điểm */}
      {showDetailDes && <AddDestination onCloseAddForm={toggleDetailDes} />}
    </div>
  );
}
