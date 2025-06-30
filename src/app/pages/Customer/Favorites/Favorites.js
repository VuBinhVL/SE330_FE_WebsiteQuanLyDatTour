import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../../components/Customer/UserSidebar/UserSidebar";
import { fetchGet, fetchDelete, BE_ENDPOINT } from "../../../lib/httpHandler";
import "./Favorites.css";

function formatCurrency(num) {
  return Number(num).toLocaleString("vi-VN") + " đ";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userId = localStorage.getItem("userId");

  // Fetch danh sách tour yêu thích
  const fetchFavorites = () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    fetchGet(
      `/api/admin/favorite-tour/user/${userId}/response`,
      (res) => {
        const favoriteData = res.data || [];
        console.log("Favorite data:", favoriteData);
        
        // Fetch thông tin chi tiết của từng tour route
        if (favoriteData.length > 0) {
          const promises = favoriteData.map(fav => 
            new Promise((resolve) => {
              fetchGet(
                `/api/admin/tour-route/get/${fav.tourRouteId}`,
                (routeRes) => {
                  const routeData = routeRes.data;
                  
                  // Fetch tours của route này để lấy thông tin giá và ngày
                  fetchGet(
                    `/api/admin/tour/get-all`,
                    (toursRes) => {
                      const allTours = toursRes.data || [];
                      const routeTours = allTours.filter(tour => tour.tourRouteId === fav.tourRouteId);
                      
                      // Lấy giá thấp nhất và các ngày khởi hành
                      const prices = routeTours.map(t => t.price).filter(p => p);
                      const dates = routeTours.map(t => t.depatureDate).filter(d => d);
                      const validDates = dates.filter(d => new Date(d) >= new Date()).sort();
                      
                      resolve({
                        ...fav,
                        id: fav.tourRouteId, // Sử dụng tourRouteId làm id chính
                        favoriteId: fav.id, // Lưu id của favorite record
                        name: routeData.routeName,
                        code: `TOUR${fav.tourRouteId}`,
                        departure: routeData.startLocation,
                        destination: routeData.endLocation,
                        image: routeData.image,
                        price: prices.length > 0 ? Math.min(...prices) : 0,
                        duration: routeData.durationDays || 1,
                        nights: (routeData.durationDays || 1) - 1,
                        validDates: validDates.slice(0, 10), // Lấy tối đa 10 ngày
                        toursCount: routeTours.length
                      });
                    },
                    () => resolve({
                      ...fav,
                      id: fav.tourRouteId,
                      favoriteId: fav.id,
                      name: routeData.routeName,
                      code: `TOUR${fav.tourRouteId}`,
                      departure: routeData.startLocation,
                      destination: routeData.endLocation,
                      image: routeData.image,
                      price: 0,
                      duration: routeData.durationDays || 1,
                      nights: (routeData.durationDays || 1) - 1,
                      validDates: [],
                      toursCount: 0
                    })
                  );
                },
                () => resolve(null)
              );
            })
          );
          
          Promise.all(promises).then(results => {
            const validResults = results.filter(r => r !== null);
            setFavorites(validResults);
            setLoading(false);
          });
        } else {
          setFavorites([]);
          setLoading(false);
        }
      },
      () => {
        setFavorites([]);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Xóa khỏi yêu thích
  const removeFavorite = (favoriteId, tourName) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${tourName}" khỏi danh sách yêu thích?`)) {
      fetchDelete(
        `/api/admin/favorite-tour/remove/${favoriteId}`,
        () => {
          // Cập nhật state local
          setFavorites(prev => prev.filter(fav => fav.favoriteId !== favoriteId));
        },
        (error) => {
          console.error("Error removing favorite:", error);
          alert("Có lỗi xảy ra khi xóa khỏi yêu thích!");
        }
      );
    }
  };

  // Chuyển sang trang chi tiết tour
  const handleBookNow = (tourRouteId) => {
    // Tìm tour đầu tiên của route này để navigate
    fetchGet(
      `/api/admin/tour/get-all`,
      (res) => {
        const allTours = res.data || [];
        const routeTour = allTours.find(tour => tour.tourRouteId === tourRouteId);
        if (routeTour) {
          navigate(`/tour-detail/${routeTour.id}`);
        } else {
          alert("Không tìm thấy tour khả dụng!");
        }
      },
      () => {
        alert("Có lỗi xảy ra khi tải thông tin tour!");
      }
    );
  };

  return (
    <div className="favorites-container">
      <UserSidebar />
      <main className="favorites-main">
        <div className="favorites-header">
          <h2 className="favorites-title">YÊU THÍCH ĐÃ LUU</h2>
        </div>

        <div className="favorites-content">
          <div className="favorites-top-bar">
            <div className="favorites-stats">
              <div>
                Tổng cộng: <span className="favorites-count">{favorites.length}</span> tour yêu thích
              </div>
            </div>
          </div>

          {loading ? (
            <div className="favorites-loading">Đang tải danh sách yêu thích...</div>
          ) : favorites.length === 0 ? (
            <div className="favorites-empty">
              <div className="empty-icon">💝</div>
              <h3>Chưa có tour yêu thích nào</h3>
              <p>Hãy khám phá và lưu những tour du lịch mà bạn quan tâm!</p>
              <button 
                className="empty-action-btn"
                onClick={() => navigate('/search')}
              >
                Khám phá tour
              </button>
            </div>
          ) : (
            <div className="favorites-section">
              <div className="favorites-tour-list">
                {favorites.map((tour) => (
                  <div className="favorites-tour-card" key={tour.id}>
                    <div className="favorites-tour-img">
                      <img
                        src={
                          tour.image?.startsWith("http")
                            ? tour.image
                            : `${BE_ENDPOINT}/${tour.image}`
                        }
                        alt={tour.name}
                        onError={(e) => {
                          e.target.src = "/default-tour.jpg"; // Fallback image
                        }}
                      />
                      <button
                        className="favorites-favorite-btn active"
                        title="Xóa khỏi yêu thích"
                        onClick={() => removeFavorite(tour.favoriteId, tour.name)}
                      >
                        <span
                          role="img"
                          aria-label="heart"
                          style={{
                            color: "#e53935",
                            transition: "color 0.2s",
                            filter: "drop-shadow(0 0 4px #e5393533)",
                          }}
                        >
                          ♥
                        </span>
                      </button>
                    </div>
                    <div className="favorites-tour-info">
                      <div className="favorites-tour-title">{tour.name}</div>
                      <div className="favorites-tour-meta">
                        <div>
                          <b>Mã tour:</b> 
                          <span>{tour.code}</span>
                        </div>
                        <div>
                          <b>Thời gian:</b> 
                          <span>{tour.duration}N{tour.nights}Đ</span>
                        </div>
                        <div>
                          <b>Khởi hành:</b> 
                          <span>{tour.departure}</span>
                        </div>
                        <div>
                          <b>Điểm đến:</b> 
                          <span>{tour.destination}</span>
                        </div>
                        {tour.validDates.length > 0 && (
                          <div>
                            <b>Ngày khởi hành:</b>
                            <div style={{ marginTop: '4px' }}>
                              {tour.validDates.slice(0, 3).map((d) => (
                                <span className="favorites-tour-date" key={d}>
                                  {formatDate(d)}
                                </span>
                              ))}
                              {tour.validDates.length > 3 && (
                                <span className="favorites-tour-date favorites-more-date">
                                  +{tour.validDates.length - 3} ngày khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="favorites-tour-bottom">
                        <div className="favorites-tour-price">
                          {tour.price > 0 ? (
                            <>
                              Giá từ: <span>{formatCurrency(tour.price)}</span>
                            </>
                          ) : (
                            <span style={{ color: '#999' }}>Liên hệ để biết giá</span>
                          )}
                        </div>
                        <button 
                          className="favorites-book-btn" 
                          onClick={() => handleBookNow(tour.id)}
                          disabled={tour.toursCount === 0}
                        >
                          {tour.toursCount > 0 ? 'Đặt ngay' : 'Hết tour'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
