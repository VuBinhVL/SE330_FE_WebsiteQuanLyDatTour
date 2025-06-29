import { useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { FaArrowLeft, FaArrowRight, FaCartPlus, FaHeart } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuAlarmClockCheck, LuTicketCheck } from "react-icons/lu";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchDelete, fetchGet, fetchPost } from "../../../lib/httpHandler";
import "./TourDetail.css";

export default function TourDetail() {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [itineraryPage, setItineraryPage] = useState(0);
  const userId = localStorage.getItem("userId");
  const [favorites, setFavorites] = useState({});
  const { id } = useParams();
  const [data, setData] = useState({
    idTourRoute: null,
    name: "",
    startLocation: "",
    endLocation: "",
    isFavorite: false,
    tours: [],
    itinerary: [],
  });
  const [selectedTour, setSelectedTour] = useState(null);
  //Hàm dung để lấy class cho biểu tượng trái tim
  const getHeartClass = (isFavorite) => {
    return isFavorite ? "liked" : "not-liked";
  };

  //Gom nhóm các ngày trong lịch trình
  const groupItineraryByDay = (itinerary) => {
    const grouped = {};

    itinerary.forEach((item) => {
      const { day, order, attractionName, galleries } = item;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push({ order, attractionName, galleries });
    });

    // Chuyển object -> mảng có định dạng cần thiết
    return Object.entries(grouped).map(([day, events]) => ({
      day: parseInt(day),
      events,
    }));
  };

  //Gọi API để lấy dữ liệu tour
  useEffect(() => {
    const uri = `/api/tour-route/${id}?userId=${userId ?? ""}`;
    fetchGet(
      uri,
      (res) => {
        const groupedItinerary = groupItineraryByDay(res.itinerary);
        setData({ ...res, itinerary: groupedItinerary });
        console.log("Dữ liệu tour:", res);
      },
      (err) => {
        console.error("Lỗi khi lấy dữ liệu:", err);
      },
      () => {
        console.error("Máy chủ mất kết nối, không thể lấy dữ liệu tour.");
      }
    );
  }, [id, userId]);

  const totalPages = Math.ceil(data.itinerary.length / 3);
  const handlePrev = () => {
    setItineraryPage((prev) => Math.max(prev - 1, 0));
  };
  const handleNext = () => {
    setItineraryPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  //Gọi API thích tour
  // Hàm xử lý toggle favorite
  const toggleFavorite = (tourRouteId) => {
    if (!userId) {
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
      // Gọi API xóa tour yêu thích
      fetchDelete(
        `/api/admin/favorite-tour/remove/${favorites[tourRouteId]}`,
        (response) => {
          setFavorites((prev) => ({
            ...prev,
            [tourRouteId]: false,
          }));
          setData((prev) => ({ ...prev, isFavorite: false }));
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
            [tourRouteId]: response.data?.id || tourRouteId,
          }));
          setData((prev) => ({ ...prev, isFavorite: true }));
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

  //Hàm thêm tour vào giỏ hàng
  const handleAddToCart = (tour) => {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để thêm tour vào giỏ hàng!", {
        autoClose: 5000,
      });
      return;
    }

    if (!tour || !tour.idTour) {
      toast.error("Vui lòng chọn ngày đi trước!", { autoClose: 5000 });
      return;
    }

    const requestData = {
      userId: Number(userId),
      tourId: tour.idTour,
      quantity: quantity,
      price: tour.price,
      departureDay: tour.pickUpTime, // ISO string từ API
    };

    fetchPost(
      "/api/cart/add",
      requestData,
      (res) => {
        toast.success(res.message || "Đã thêm vào giỏ hàng!", {
          autoClose: 5000,
        });
      },
      (err) => {
        console.error("Lỗi thêm giỏ hàng:", err);
        toast.error(err?.data?.message || "Không thể thêm vào giỏ!", {
          autoClose: 5000,
        });
      },
      () => {
        toast.error("Mất kết nối máy chủ!", { autoClose: 5000 });
      }
    );
  };

  return (
    <div className="tour-detail-container">
      <h2 className="tour-title">{data.name || "Tour mới chưa có tên"}</h2>

      <div className="tour-main">
        <div className="tour-image">
          {data.tours[0]?.galleries?.length > 0 && (
            <>
              <img src={data.tours[0].galleries[currentImage]} alt="Tour" />
              <button
                className="image-nav left"
                onClick={() =>
                  setCurrentImage(
                    (currentImage - 1 + data.tours[0].galleries.length) %
                      data.tours[0].galleries.length
                  )
                }
              >
                <FaArrowLeft />
              </button>
              <button
                className="image-nav right"
                onClick={() =>
                  setCurrentImage(
                    (currentImage + 1) % data.tours[0].galleries.length
                  )
                }
              >
                <FaArrowRight />
              </button>
            </>
          )}
          <div
            className="heart-icon"
            onClick={() => toggleFavorite(data.idTourRoute)}
          >
            <FaHeart
              className={getHeartClass(
                data.isFavorite || favorites[data.idTourRoute]
              )}
            />
          </div>
        </div>

        <div className="booking-panel">
          <h3>ĐẶT VÉ</h3>
          <div className="booking-field">
            <label>Ngày đi:</label>
            <select
              className="date-select"
              value={selectedTour?.departureDate || ""}
              onChange={(e) => {
                const selected = data.tours.find(
                  (t) => t.departureDate === e.target.value
                );
                setSelectedTour(selected);
                setCurrentImage(0);
              }}
            >
              <option value="" disabled>
                -- Chọn ngày --
              </option>
              {data.tours.map((tour) => (
                <option key={tour.idTour} value={tour.departureDate}>
                  {new Date(tour.departureDate).toLocaleDateString("vi-VN")}
                </option>
              ))}
            </select>
          </div>
          <div className="booking-field">
            <label>Giá vé:</label>
            <span className="price">
              {selectedTour?.price?.toLocaleString() || "0"} đ / Khách
            </span>
          </div>
          <div className="booking-field">
            <label>Số lượng:</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </button>
              <span>
                <strong>{quantity}</strong> người
              </span>
              <button
                onClick={() => {
                  const availableSeats =
                    selectedTour?.totalSeats - selectedTour?.bookedSeats || 0;
                  if (quantity < availableSeats) {
                    setQuantity(quantity + 1);
                  }
                }}
                disabled={
                  selectedTour
                    ? quantity >=
                      selectedTour.totalSeats - selectedTour.bookedSeats
                    : false
                }
              >
                +
              </button>
            </div>
          </div>
          <div className="booking-field">
            <label>Tổng tiền:</label>
            <div className="booking-total">
              {(selectedTour?.price * quantity || 0).toLocaleString()} đ
            </div>
          </div>

          <div className="booking-actions">
            <button
              className="btn-cart"
              onClick={() => handleAddToCart(selectedTour)}
            >
              <FaCartPlus /> Thêm
            </button>
            <button className="btn-order">Đặt ngay ➜</button>
          </div>

          {/* <button className="btn-passenger">
            <FaUser /> Nhập thông tin hành khách
          </button> */}

          <div className="trip-info">
            <hr />
            <h6>
              <strong>THÔNG TIN VỀ CHUYẾN ĐI</strong>
            </h6>
            <p>
              <IoLocationOutline className="icon" /> Khởi hành:{" "}
              <b>{data?.startLocation}</b>
            </p>
            <p>
              <IoLocationOutline className="icon" /> Điểm đến:{" "}
              <b>{data?.endLocation}</b>
            </p>
            <p>
              <LuAlarmClockCheck /> Thời gian:{" "}
              <b>{selectedTour?.duration || data.tours[0]?.duration} ngày</b>
            </p>
            <p>
              <CiCalendar /> Ngày kết thúc:{" "}
              <b>
                {new Date(
                  selectedTour?.returnDate || data.tours[0]?.returnDate
                ).toLocaleDateString("vi-VN")}
              </b>
            </p>
            <p>
              <LuTicketCheck /> Số chỗ còn trống:{" "}
              <b>
                {selectedTour?.totalSeats - selectedTour?.bookedSeats || ""}
              </b>
            </p>
            <p>
              <IoLocationOutline className="icon" /> Điểm xuất phát:{" "}
              <b>
                {" "}
                {selectedTour?.pickUpLocation || data.tours[0]?.pickUpLocation}
              </b>
            </p>
            <p>
              <LuAlarmClockCheck /> Giờ xuất phát:{" "}
              <b>
                {new Date(
                  selectedTour?.pickUpTime || data.tours[0]?.pickUpTime
                ).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </b>
            </p>
          </div>
        </div>
      </div>

      <div className="itinerary-section">
        <div className="itinerary-title">LỊCH TRÌNH</div>
        <div className="itinerary-controls">
          <button onClick={handlePrev}>
            <FaArrowLeft />
          </button>
          <button onClick={handleNext}>
            <FaArrowRight />
          </button>
        </div>

        <div className="itinerary-slider">
          {data.itinerary
            .slice(itineraryPage * 3, itineraryPage * 3 + 3)
            .map((dayGroup, index) => (
              <div className="day-column" key={index}>
                <h4>Ngày {dayGroup.day}</h4>
                <ul>
                  {dayGroup.events.map((event, idx) => (
                    <li key={idx}>
                      <span className="icon">#{event.order}</span>
                      <span className="tag">{event.attractionName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
