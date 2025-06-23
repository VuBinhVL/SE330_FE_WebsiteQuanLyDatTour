import React, { useState, useEffect } from "react";
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
import { toast } from "react-toastify";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { BE_ENDPOINT, fetchGet, fetchPost, fetchDelete } from "../../../lib/httpHandler";
import { useAuth } from "../../../lib/AuthContext";

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

export default function Banner() {
  const { isLoggedIn } = useAuth();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState({});
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [popularChoices, setPopularChoices] = useState([]);

  const userId = localStorage.getItem("userId");

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  // Format LocalDateTime thành DD/MM
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  // Format giá thành X.XXX.XXX VND
  const formatPrice = (price) => {
    if (!price) return "0 VND";
    return `${Math.round(price).toLocaleString("vi-VN")} VND`;
  };

  // Gọi API để lấy danh sách tour yêu thích theo userId
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchGet(
        `/api/admin/favorite-tour/user/${userId}`,
        (response) => {
          if (response?.data) {
            const favoriteMap = {};
            response.data.forEach((item) => {
              favoriteMap[item.tourRouteId] = item.id; // Lưu ID của favorite tour để xóa
            });
            setFavorites(favoriteMap);
          }
        },
        (err) => {
          console.log("Lỗi khi lấy danh sách tour yêu thích:", err);
          toast.error(err?.data?.message || "Lấy danh sách tour yêu thích thất bại!", {
            autoClose: 5000,
          });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng!", {
            autoClose: 5000,
          });
        }
      );
    }
  }, [isLoggedIn, userId]);

  // Gọi API cho favoriteDestinations
  useEffect(() => {
    const fetchFavoriteDestinations = () => {
      fetchGet(
        "/api/admin/tourist-attraction/top-5-favorite",
        (response) => {
          if (response?.data) {
            setFavoriteDestinations(response.data);
          } else {
            toast.error("Dữ liệu API không đúng định dạng!", { autoClose: 5000 });
          }
        },
        (err) => {
          console.log("Lỗi khi lấy top 5 địa điểm du lịch:", err);
          toast.error(err?.data?.message || "Lấy dữ liệu thất bại!", {
            autoClose: 5000,
          });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng!", {
            autoClose: 5000,
          });
        }
      );
    };

    fetchFavoriteDestinations();
  }, []);

  // Gọi API cho popularChoices
  useEffect(() => {
    const fetchPopularTourRoutes = () => {
      fetchGet(
        "/api/admin/tour/top-5-popular-tour-routes",
        (response) => {
          if (response?.data) {
            const formattedData = response.data.map((item) => ({
              id: item.id,
              name: item.routeName,
              image: item.image || "https://via.placeholder.com/300",
              dates: item.recentStartDates ? item.recentStartDates.map(formatDate) : [],
              duration: item.durationDays ? `${item.durationDays} ngày` : "0 ngày",
              price: formatPrice(item.latestPrice),
            }));
            setPopularChoices(formattedData);
          } else {
            toast.error("Dữ liệu API không đúng định dạng!", { autoClose: 5000 });
          }
        },
        (err) => {
          console.log("Lỗi khi lấy top 5 tuyến du lịch:", err);
          toast.error(err?.data?.message || "Lấy dữ liệu thất bại!", {
            autoClose: 5000,
          });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng!", {
            autoClose: 5000,
          });
        }
      );
    };

    fetchPopularTourRoutes();
  }, []);

  // Hàm xử lý toggle favorite
  const toggleFavorite = (tourRouteId) => {
    if (!isLoggedIn || !userId) {
      toast.error("Bạn cần đăng nhập để thực hiện hành động này!", { autoClose: 5000 });
      return;
    }

    if (!tourRouteId) {
      toast.error("ID tuyến tour không hợp lệ!", { autoClose: 5000 });
      return;
    }

    const isFavorite = !!favorites[tourRouteId];

    if (isFavorite) {
      // Gọi API xóa tour yêu thích
      fetchDelete(
        `/api/admin/favorite-tour/remove/${favorites[tourRouteId]}`,
        (response) => {
          setFavorites((prev) => ({
            ...prev,
            [tourRouteId]: false,
          }));
          toast.success("Xóa tour yêu thích thành công!", { autoClose: 5000 });
        },
        (err) => {
          console.log("Lỗi khi xóa tour yêu thích:", err);
          toast.error(err?.data?.message || "Xóa tour yêu thích thất bại!", {
            autoClose: 5000,
          });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng!", {
            autoClose: 5000,
          });
        }
      );
    } else {
      // Gọi API thêm tour yêu thích
      fetchPost(
        "/api/admin/favorite-tour/add",
        { userID: Number(userId), tourRouteId: Number(tourRouteId) }, // Sử dụng userID và tourRouteId
        (response) => {
          setFavorites((prev) => ({
            ...prev,
            [tourRouteId]: response.data?.id || tourRouteId, // Lưu ID của favorite tour mới
          }));
          toast.success("Thêm tour yêu thích thành công!", { autoClose: 5000 });
        },
        (err) => {
          console.log("Lỗi khi thêm tour yêu thích:", err);
          toast.error(err?.data?.message || "Thêm tour yêu thích thất bại!", {
            autoClose: 5000,
          });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng!", {
            autoClose: 5000,
          });
        }
      );
    }
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
                fontSize: "14px",
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
              fontSize: "14px",
              padding: "0 10px",
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
          {Array.isArray(popularChoices) && popularChoices.length > 0 ? (
            popularChoices.map((item) => (
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
            ))
          ) : (
            <p>Đang tải dữ liệu...</p>
          )}
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
          {Array.isArray(favoriteDestinations) && favoriteDestinations.length > 0 ? (
            favoriteDestinations.map((item) => (
              <div key={item.id} className="favorite-destination-item">
                <img
                  src={item.image || "https://via.placeholder.com/300"}
                  alt={item.name}
                  className="destination-image"
                />
                <div className="destination-overlay"></div>
                <h3 className="destination-name">{item.name}</h3>
              </div>
            ))
          ) : (
            <p>Đang tải dữ liệu...</p>
          )}
        </div>
      </div>
    </div>
  );
}