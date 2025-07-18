import { useCallback, useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { FaArrowLeft, FaArrowRight, FaCartPlus, FaHeart, FaStar } from "react-icons/fa";
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
    averageRating: 0,
    totalReviews: 0,
  });
  const [selectedTour, setSelectedTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
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

  // Hàm lấy danh sách đánh giá
  const fetchReviews = useCallback(() => {
    fetchGet(
      `/api/reviews/tour/${id}`,
      (res) => {
        setReviews(res);
        // Tính toán rating trung bình
        if (res.length > 0) {
          const avgRating = res.reduce((sum, review) => sum + review.rating, 0) / res.length;
          setData(prev => ({
            ...prev,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: res.length
          }));
        } else {
          // Trường hợp không có review nào
          setData(prev => ({
            ...prev,
            averageRating: 0,
            totalReviews: 0
          }));
        }
      },
      (err) => {
        console.error("Lỗi khi lấy đánh giá:", err);
        // Đặt giá trị mặc định khi có lỗi
        setData(prev => ({
          ...prev,
          averageRating: 0,
          totalReviews: 0
        }));
      },
      () => {
        console.error("Không thể lấy danh sách đánh giá");
        // Đặt giá trị mặc định khi không kết nối được
        setData(prev => ({
          ...prev,
          averageRating: 0,
          totalReviews: 0
        }));
      }
    );
  }, [id]);

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

  // useEffect riêng cho việc lấy reviews
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Hàm gửi đánh giá
  const handleSubmitReview = () => {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để đánh giá!", { autoClose: 5000 });
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!", { autoClose: 5000 });
      return;
    }

    const reviewData = {
      userId: Number(userId),
      tourRouteId: Number(id),
      rating: newReview.rating,
      comment: newReview.comment.trim(),
    };

    fetchPost(
      "/api/reviews",
      reviewData,
      (res) => {
        toast.success("Đánh giá của bạn đã được gửi!", { autoClose: 5000 });
        setNewReview({ rating: 5, comment: "" });
        setShowReviewForm(false);
        fetchReviews(); // Reload reviews
      },
      (err) => {
        console.error("Lỗi khi gửi đánh giá:", err);
        toast.error("Không thể gửi đánh giá!", { autoClose: 5000 });
      },
      () => {
        toast.error("Lỗi kết nối mạng!", { autoClose: 5000 });
      }
    );
  };

  // Hàm render sao
  const renderStars = (rating, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} color="#ffc107" size={size} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} color="#ffc107" size={size} style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<FaStar key={i} color="#e0e0e0" size={size} />);
      }
    }
    return stars;
  };

  // Hàm render sao có thể click (cho form đánh giá)
  const renderClickableStars = (currentRating, onRatingChange) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= currentRating ? "#ffc107" : "#e0e0e0"}
          size={20}
          style={{ cursor: "pointer", margin: "0 2px" }}
          onClick={() => onRatingChange(i)}
        />
      );
    }
    return stars;
  };

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

  //Hàm chuyển hướng đến trang đặt tour
  const handleOrderNow = (tour) => {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để đặt tour!", { autoClose: 5000 });
      return;
    }

    if (!tour || !tour.idTour) {
      toast.error("Vui lòng chọn ngày đi trước!", { autoClose: 5000 });
      return;
    }

    const selectedItems = [
      {
        id: tour.idTour,
        tourId: tour.idTour,
        routeName: data.name,
        routeImage: tour.galleries?.[0] || "",
        quantity: quantity,
        price: tour.price,
        departureDates: tour.departureDate,
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        duration: tour.duration,
      },
    ];

    localStorage.setItem("selectedCart", JSON.stringify(selectedItems));
    window.location.href = "/payment";
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
            <button
              className="btn-order"
              onClick={() => handleOrderNow(selectedTour)}
            >
              Đặt ngay ➜
            </button>
          </div>

          {/* <button className="btn-passenger">
            <FaUser /> Nhập thông tin hành khách
          </button> */}

          <div className="trip-info">
            <hr />
            <h6>
              <strong>THÔNG TIN VỀ CHUYẾN ĐI</strong>
            </h6>
            <div className="rating-info">
              <div className="rating-stars">
                {renderStars(data.averageRating, 18)}
                <span className="rating-text">
                  {data.averageRating > 0 ? data.averageRating : "Chưa có"} 
                  ({data.totalReviews} đánh giá)
                </span>
              </div>
            </div>
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

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h3>ĐÁNH GIÁ KHÁCH HÀNG</h3>
          <div className="reviews-summary">
            <div className="rating-overview">
              <div className="rating-stars-large">
                {renderStars(data.averageRating, 24)}
              </div>
              <div className="rating-details">
                <span className="average-rating">{data.averageRating > 0 ? data.averageRating : "0"}</span>
                <span className="total-reviews">({data.totalReviews} đánh giá)</span>
              </div>
            </div>
            <button 
              className="write-review-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Viết đánh giá
            </button>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="review-form">
            <h4>Đánh giá của bạn</h4>
            <div className="rating-input">
              <label>Xếp hạng:</label>
              <div className="stars-input">
                {renderClickableStars(newReview.rating, (rating) =>
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>
            <div className="comment-input">
              <label>Nhận xét:</label>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview(prev => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
                rows={4}
              />
            </div>
            <div className="review-form-actions">
              <button className="submit-review-btn" onClick={handleSubmitReview}>
                Gửi đánh giá
              </button>
              <button 
                className="cancel-review-btn" 
                onClick={() => {
                  setShowReviewForm(false);
                  setNewReview({ rating: 5, comment: "" });
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Khách hàng #{review.userId}
                    </span>
                    <div className="review-rating">
                      {renderStars(review.rating, 14)}
                    </div>
                  </div>
                  <div className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="review-content">
                  <p>{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>Chưa có đánh giá nào cho tour này.</p>
              <p>Hãy là người đầu tiên đánh giá!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
