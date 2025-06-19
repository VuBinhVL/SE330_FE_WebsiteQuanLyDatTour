import { useEffect, useState } from "react";
import { AiOutlineCamera, AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { fetchGet, fetchUpload } from "../../../../lib/httpHandler";
import "./AddDestination.css";

export default function AddDestination({ onCloseAddForm }) {
  const [categoryList, setCategoryList] = useState([]);
  const [images, setImages] = useState(Array(6).fill(null)); // Tối đa 6 ảnh
  const [data, setData] = useState({
    name: "",
    description: "",
    location: "",
    categoryId: "",
  });

  // Hàm cập nhật dữ liệu khi người dùng nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };
  //Hàm lấy danh sách loại địa điểm
  useEffect(() => {
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
  }, []);

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

  //Xác nhận thêm địa điểm
  const handleAdd = () => {
    if (
      !data.name ||
      !data.location ||
      !data.categoryId ||
      !data.description ||
      images.every((img) => img === null)
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("categoryId", data.categoryId);
    images.forEach((img) => {
      if (img) formData.append("images", img.file);
    });

    fetchUpload(
      "/api/admin/tourist-attraction",
      formData,
      (sus) => {
        toast.success(sus.message);
        onCloseAddForm();
      },
      (err) => toast.error(err.message),
      () => toast.error("Không thể kết nối đến máy chủ")
    );
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
                  <div className="image-wrapper">
                    <img
                      src={images[i].src}
                      alt={`Ảnh ${i + 1}`}
                      className="preview-img"
                      onClick={() => handleReplaceImage(i)}
                    />

                    <button
                      className="btn-remove-img"
                      onClick={() => handleRemoveImage(i)}
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <label className="upload-icon">
                    <AiOutlineCamera />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleAddImage(e, i)}
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
                <input
                  name="name"
                  type="text"
                  placeholder="Tên địa điểm"
                  onChange={handleChange}
                  value={data.name}
                />
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <input
                  name="location"
                  type="text"
                  placeholder="Vị trí"
                  onChange={handleChange}
                  value={data.location}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Loại địa điểm tham quan du lịch</label>
              <select
                name="categoryId"
                onChange={handleChange}
                value={data.categoryId}
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
              <input
                type="text"
                placeholder="Mô tả"
                name="description"
                onChange={handleChange}
                value={data.description}
              />
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button className="cancel-button" onClick={onCloseAddForm}>
            Hủy
          </button>
          <button className="confirm-button" onClick={handleAdd}>
            Xác nhận
          </button>
        </div>
      </div>
    </>
  );
}
