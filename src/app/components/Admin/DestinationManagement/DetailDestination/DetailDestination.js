import React, { useState } from "react";
import "./DetailDestination.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import { PiPencilSimpleLineBold } from "react-icons/pi";

export default function DetailDestination({ onCloseAddForm }) {
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 6 - images.length;
    if (files.length > maxFiles) {
      alert("Chỉ được chọn tối đa 6 ảnh.");
      return;
    }
    setImages([...images, ...files]);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  return (
    <>
      <div className="des-detail-overlay" onClick={onCloseAddForm}></div>
      <div className="des-detail-form">
        <div className="form-header">
          <h4>
            {isEditing
              ? "Sửa thông tin điểm tham quan du lịch"
              : "Thông tin điểm tham quan du lịch"}
          </h4>
          <button className="close-button" onClick={onCloseAddForm}>
            <AiOutlineClose />
          </button>
        </div>

        {!isEditing && (
          <div className="form-edit" onClick={toggleEdit}>
            <p>Chỉnh sửa</p>
            <button className="edit-button" title="Chỉnh sửa thông tin">
              <PiPencilSimpleLineBold />
            </button>
          </div>
        )}

        <div className="form-body">
          <div className="image-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="image-slot">
                {images[i] ? (
                  <img
                    src={URL.createObjectURL(images[i])}
                    alt={`Ảnh ${i + 1}`}
                    className="preview-img"
                  />
                ) : (
                  <label className="upload-icon">
                    <AiOutlineCamera />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="form-field">
            <div className="form-row">
              <div className="form-group">
                <label>Tên địa điểm</label>
                <input type="text" readOnly={!isEditing} />
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <input type="text" readOnly={!isEditing} />
              </div>
            </div>
            <div className="form-group">
              <label>Loại địa điểm tham quan du lịch</label>
              <select disabled={!isEditing}>
                <option value="">Loại điểm tham quan</option>
                <option value="Cảnh quan">Cảnh quan</option>
                <option value="Lịch sử">Lịch sử</option>
                <option value="Văn hóa">Văn hóa</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <input type="text" readOnly={!isEditing} />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="form-footer">
            <button className="cancel-button" onClick={toggleEdit}>
              Hủy
            </button>
            <button className="confirm-button" onClick={onCloseAddForm}>
              Xác nhận
            </button>
          </div>
        )}
      </div>
    </>
  );
}
