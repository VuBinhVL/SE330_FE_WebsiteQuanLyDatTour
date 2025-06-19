import React, { useEffect, useState } from "react";
import "./DetailDestination.css";
import { AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { fetchGet, BE_ENDPOINT } from "../../../../lib/httpHandler";

export default function DetailDestination({ onCloseAddForm, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [destinationData, setDestinationData] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [images, setImages] = useState(Array(6).fill(null)); // Tối đa 6 ảnh

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  //Hàm xem thông tin chi tiết địa điểm và danh sách loại địa điểm
  useEffect(() => {
    const uri = `/api/admin/tourist-attraction/${id}`;
    fetchGet(
      uri,
      (data) => {
        setDestinationData(data);
        console.log("Thông tin địa điểm:", data);
        // Cập nhật ảnh
        const filledImages = Array(6).fill(null);
        if (Array.isArray(data.galleries)) {
          data.galleries.forEach((img, i) => {
            if (i < 6) {
              const src = img.startsWith("/")
                ? `${BE_ENDPOINT}${img}`
                : `${BE_ENDPOINT}/uploads/destinations/${img}`;
              filledImages[i] = {
                src,
                file: null,
                isNew: false,
              };
            }
          });
        }
        setImages(filledImages);
      },
      (err) => console.error(err.message),
      () => console.error("Lỗi kết nối đến máy chủ")
    );

    const categoryUri = "/api/admin/category";
    fetchGet(
      categoryUri,
      (data) => {
        setCategoryList(data);
        console.log("Danh sách loại địa điểm:", data);
      },
      (err) => console.error(err.message),
      () => console.error("Lỗi kết nối đến máy chủ")
    );
  }, [id]);

  // Hàm thêm ảnh
  const handleAddImage = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const newImage = {
      file,
      src: URL.createObjectURL(file),
      isNew: true,
    };

    const updatedImages = [...images];
    updatedImages[index] = newImage;
    setImages(updatedImages);
  };

  // Hàm thay thế ảnh
  const handleReplaceImage = (index) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const updatedImages = [...images];
      updatedImages[index] = {
        file,
        src: URL.createObjectURL(file),
        isNew: true,
      };
      setImages(updatedImages);
    };
    fileInput.click();
  };

  // Hàm xóa ảnh
  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages[index] = null;
    setImages(updatedImages);
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
            {images.map((img, i) => (
              <div key={i} className="image-slot">
                {img ? (
                  <div className="image-wrapper">
                    <img
                      src={img.src}
                      alt={`Ảnh ${i + 1}`}
                      className="preview-img"
                      onClick={() => handleReplaceImage(i)}
                    />
                    {isEditing && (
                      <button
                        className="btn-remove-img"
                        onClick={() => handleRemoveImage(i)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ) : (
                  isEditing && (
                    <label className="upload-icon">
                      <AiOutlineCamera />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleAddImage(e, i)}
                      />
                    </label>
                  )
                )}
              </div>
            ))}
          </div>

          <div className="form-field">
            <div className="form-row">
              <div className="form-group">
                <label>Tên địa điểm</label>
                <input
                  type="text"
                  readOnly={!isEditing}
                  value={destinationData?.name || ""}
                />
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <input
                  type="text"
                  readOnly={!isEditing}
                  value={destinationData?.location || ""}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Loại địa điểm tham quan du lịch</label>
              <select
                disabled={!isEditing}
                value={destinationData?.categoryId || ""}
              >
                {categoryList.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                rows="4"
                type="text"
                readOnly={!isEditing}
                value={destinationData?.description || ""}
              />
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
