import React, { useState } from "react";
import "./AddDestination.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";

export default function AddDestination({ onCloseAddForm }) {
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 6 - images.length;
    if (files.length > maxFiles) {
      alert("Chỉ được chọn tối đa 6 ảnh.");
      return;
    }
    setImages([...images, ...files]);
  };

  return (
    <>
      <div className="des-add-overlay" onClick={onCloseAddForm}></div>
      <div className="des-add-form">
        <div className="form-header">
          <h4>Thêm điểm tham quan du lịch</h4>
          <button className="close-button" onClick={onCloseAddForm}>
            <AiOutlineClose />
          </button>
        </div>

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
                <input type="text" placeholder="Tên địa điểm" />
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <input type="text" placeholder="Vị trí" />
              </div>
            </div>
            <div className="form-group">
              <label>Loại địa điểm tham quan du lịch</label>
              <select>
                <option value="">Loại điểm tham quan</option>
                <option value="Cảnh quan">Cảnh quan</option>
                <option value="Lịch sử">Lịch sử</option>
                <option value="Văn hóa">Văn hóa</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <input type="text" placeholder="Mô tả" />
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button className="cancel-button" onClick={onCloseAddForm}>
            Hủy
          </button>
          <button className="confirm-button" onClick={onCloseAddForm}>
            Xác nhận
          </button>
        </div>
      </div>
    </>
  );
}
