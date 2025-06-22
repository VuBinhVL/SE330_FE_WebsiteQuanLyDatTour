import React, { useState } from "react";
import "./Home.css";
import { 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  TextField 
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

// Dữ liệu mẫu cho banner (ảnh tĩnh)
const banners = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    alt: "Banner 1",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    alt: "Banner 2",
  },
];

// Dữ liệu giả cho popular choices
const popularChoices = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    name: "Hà Nội - Sapa",
    dates: ["01/03", "04/03", "15/03", "20/04"],
    duration: "5 ngày",
    price: "8.000.000 VND",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1519046904884-5315520d7548?auto=format&fit=crop&w=300&q=80",
    name: "Đà Nẵng - Hội An",
    dates: ["02/03", "05/03", "10/03", "25/04"],
    duration: "4 ngày",
    price: "7.500.000 VND",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
    name: "Phú Quốc",
    dates: ["03/03", "06/03", "12/03", "22/04"],
    duration: "3 ngày",
    price: "9.000.000 VND",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&w=300&q=80",
    name: "Hà Nội - Hạ Long",
    dates: ["04/03", "07/03", "14/03", "21/04"],
    duration: "2 ngày",
    price: "5.000.000 VND",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=300&q=80",
    name: "Nha Trang",
    dates: ["05/03", "08/03", "16/03", "23/04"],
    duration: "5 ngày",
    price: "8.500.000 VND",
  },
];

// Dữ liệu giả cho favorite destinations
const favoriteDestinations = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
    name: "Hà Nội",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    name: "Đà Lạt",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519046904884-5315520d7548?auto=format&fit=crop&w=300&q=80",
    name: "Phú Quốc",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&w=300&q=80",
    name: "Hội An",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=300&q=80",
    name: "Sapa",
  },
];

export default function Banner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState({}); // Trạng thái để theo dõi favorite

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id], // Chuyển đổi trạng thái favorite cho item
    }));
  };

  return (
    <div className="banner-container">
      <div className="banner-wrapper">
        <IconButton
          onClick={handlePrevBanner}
          className="banner-arrow banner-arrow-left"
        >
          <ArrowBackIosIcon />
        </IconButton>

        <img
          src={banners[currentBanner].image}
          alt={banners[currentBanner].alt}
          className="banner-image"
        />

        <IconButton
          onClick={handleNextBanner}
          className="banner-arrow banner-arrow-right"
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </div>

      <div className="banner-indicators">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`indicator ${index === currentBanner ? "active" : ""}`}
            onClick={() => setCurrentBanner(index)}
          ></span>
        ))}
      </div>

      {/* Form tìm kiếm */}
      <div className="overlay-text">
        <div className="overlay-row overlay-header">
          <span>Bạn muốn đi đâu?</span>
          <span>Ngày đi</span>
          <span>Ngân sách</span>
          <span> </span>
        </div>

        <div className="overlay-row overlay-inputs">
          <TextField
            fullWidth
            placeholder="Tìm kiếm với bất kỳ địa danh bạn yêu thích"
            variant="outlined"
            sx={{
              "& .MuiInputBase-root": {
                height: "48px",
                fontSize: "16px",
              },
              "& .MuiInputBase-input::placeholder": {
                fontSize: "14px", // Giảm font-size của placeholder để vừa
              },
            }}
          />
          <TextField
            fullWidth
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputBase-root": {
                height: "48px",
                fontSize: "16px",
              },
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Chọn mức giá</InputLabel>
            <Select
              label="Chọn mức giá"
              defaultValue=""
              sx={{
                height: "48px",
                fontSize: "16px",
              }}
            >
              <MenuItem value="low">Dưới 5 triệu</MenuItem>
              <MenuItem value="medium">5-10 triệu</MenuItem>
              <MenuItem value="high">Trên 10 triệu</MenuItem>
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            sx={{
              height: "48px",
              fontSize: "14px", // Giảm font-size của nút Tìm kiếm
              padding: "0 10px", // Giảm padding để nút nhỏ hơn
            }}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* FormControl cho các lựa chọn du lịch */}
      <div className="popular-choices-container">
        <h2 className="popular-choices-title">Lựa chọn du lịch được yêu thích</h2>
        <div className="popular-choices-items">
          {popularChoices.map((item) => (
            <div key={item.id} className="popular-choice-item">
              <div className="image-wrapper">
                <img src={item.image} alt={item.name} className="item-image" />
                <IconButton
                  onClick={() => toggleFavorite(item.id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    backgroundColor: "transparent",
                    color: "#FF0000",
                    padding: "4px",
                    zIndex: 100,
                  }}
                >
                  {favorites[item.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </div>
              <h3 className="item-name">{item.name}</h3>
              <div className="item-dates">
                {item.dates.map((date, index) => (
                  <span key={index} className="date-chip">{date}</span>
                ))}
              </div>
              <div className="item-duration">
                <AccessTimeIcon className="duration-icon" />
                <span>{item.duration}</span>
              </div>
              <div className="item-price">
                <span className="price-label">Giá từ:</span>
                <span className="price-value">{item.price}</span>
              </div>
              <Button
                variant="outlined"
                className="book-now-button"
              >
                Đặt ngay
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outlined"
          color="primary"
          className="view-more-button"
        >
          Xem thêm
        </Button>
      </div>

      {/* FormControl cho danh sách địa điểm du lịch */}
      <div className="favorite-destinations-container">
        <h2 className="favorite-destinations-title">Danh sách địa điểm du lịch được ưa thích</h2>
        <div className="favorite-destinations-items">
          {favoriteDestinations.map((item) => (
            <div key={item.id} className="favorite-destination-item">
              <img src={item.image} alt={item.name} className="destination-image" />
              <div className="destination-overlay"></div>
              <h3 className="destination-name">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}