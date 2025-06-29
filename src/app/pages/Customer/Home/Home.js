import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { toast } from "react-toastify";
import banner from "../../../assets/images/customer/banner.png";
import { useAuth } from "../../../lib/AuthContext";
import { fetchDelete, fetchGet, fetchPost } from "../../../lib/httpHandler";
import "./Home.css";

// Dữ liệu mẫu cho banner (ảnh tĩnh)
const banners = [
  {
    id: 1,
    image: banner,

    alt: "Banner 1",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    alt: "Banner 2",
  },
];

// Budget options (đồng nhất với Search.js)
const BUDGETS = [
  { label: "Dưới 5 triệu", value: "under5" },
  { label: "Từ 5 - 10 triệu", value: "5to10" },
  { label: "Từ 10 - 50 triệu", value: "10to50" },
  { label: "Trên 50 triệu", value: "over50" },
];

export default function Banner() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState({});
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [popularChoices, setPopularChoices] = useState([]);
  const [destination, setDestination] = useState(""); // Thêm state cho điểm đến
  const [date, setDate] = useState(""); // Thêm state cho ngày đi
  const [budget, setBudget] = useState(""); // Thêm state cho ngân sách

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
          toast.error(
            err?.data?.message || "Lấy danh sách tour yêu thích thất bại!",
            {
              autoClose: 5000,
            }
          );
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
            toast.error("Dữ liệu API không đúng định dạng!", {
              autoClose: 5000,
            });
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
              dates: item.recentStartDates
                ? item.recentStartDates.map(formatDate)
                : [],
              duration: item.durationDays
                ? `${item.durationDays} ngày`
                : "0 ngày",
              price: formatPrice(item.latestPrice),
            }));
            setPopularChoices(formattedData);
          } else {
            toast.error("Dữ liệu API không đúng định dạng!", {
              autoClose: 5000,
            });
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
      toast.error("Bạn cần đăng nhập để thực hiện hành động này!", {
        autoClose: 5000,
      });
      return;
    }

    if (!tourRouteId) {
      toast.error("ID tuyến tour không hợp lệ!", { autoClose: 5000 });
      return;
    }

    const isFavorite = !!favorites[tourRouteId];

    if (isFavorite) {
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
      fetchPost(
        "/api/admin/favorite-tour/add",
        { userID: Number(userId), tourRouteId: Number(tourRouteId) },
        (response) => {
          setFavorites((prev) => ({
            ...prev,
            [tourRouteId]: response.data?.id || tourRouteId,
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

  // Hàm xử lý khi nhấn nút Xem thêm
  const handleViewMore = () => {
    navigate("/search");
  };

  // Hàm xử lý khi nhấn vào địa điểm yêu thích
  const handleDestinationClick = (location) => {
    navigate(`/search?destination=${encodeURIComponent(location)}`);
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (budget) params.set("budget", budget);
    navigate(`/search?${params.toString()}`);
  };

  //Mở trang chi tiết tour khi click vào ảnh
  const handleTourDetail = (tourRouteId) => {
    if (!tourRouteId) {
      toast.error("ID tuyến tour không hợp lệ!", { autoClose: 5000 });
      return;
    }
    window.location.href = `/tour-detail/${tourRouteId}`;
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

      {/* Form tìm kiếm đồng nhất với Search.js */}
      <div className="overlay-text">
        <div className="overlay-row overlay-header">
          <span>Điểm đến</span>
          <span>Ngày đi</span>
          <span>Ngân sách</span>
          <span> </span>
        </div>

        <div className="overlay-row overlay-inputs">
          <FormControl fullWidth>
            <InputLabel>Chọn điểm đến</InputLabel>
            <Select
              label="Chọn điểm đến"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              sx={{
                height: "48px",
                fontSize: "16px",
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {favoriteDestinations.map((dest) => (
                <MenuItem key={dest.id} value={dest.location}>
                  {dest.location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
              label
              rosa="Chọn mức giá"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              sx={{
                height: " olhou48px",
                fontSize: "16px",
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {BUDGETS.map((b) => (
                <MenuItem key={b.value} value={b.value}>
                  {b.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch} // Gọi hàm handleSearch khi nhấn nút
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
        <h2 className="popular-choices-title">
          Lựa chọn du lịch được yêu thích
        </h2>
        <div className="popular-choices-items">
          {Array.isArray(popularChoices) && popularChoices.length > 0 ? (
            popularChoices.map((item) => (
              <div key={item.id} className="popular-choice-item">
                <div className="image-wrapper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-image"
                  />
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
                    {favorites[item.id] ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </div>
                <h3 className="item-name">{item.name}</h3>
                <div className="item-dates">
                  {item.dates.map((date, index) => (
                    <span key={index} className="date-chip">
                      {date}
                    </span>
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
                  onClick={() => handleTourDetail(item.id)}
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
          onClick={handleViewMore}
        >
          Xem thêm
        </Button>
      </div>

      {/* FormControl cho danh sách địa điểm du lịch */}
      <div className="favorite-destinations-container">
        <h2 className="favorite-destinations-title">
          Danh sách địa điểm du lịch được ưa thích
        </h2>

        <div className="favorite-destinations-items">
          {Array.isArray(favoriteDestinations) &&
          favoriteDestinations.length > 0 ? (
            favoriteDestinations.map((item) => (
              <div
                key={item.id}
                className="favorite-destination-item"
                onClick={() => handleDestinationClick(item.location)} // Thêm sự kiện onClick
                style={{ cursor: "pointer" }} // Thêm style để chỉ báo có thể click
              >
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
