import React, { useEffect, useState, useMemo } from "react";
import "./Search.css";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchGet, fetchPost, fetchDelete, BE_ENDPOINT } from "../../../lib/httpHandler";
import { useAuth } from "../../../lib/AuthContext";

// Budget options
const BUDGETS = [
  { label: "Dưới 5 triệu", value: "under5" },
  { label: "Từ 5 - 10 triệu", value: "5to10" },
  { label: "Từ 10 - 50 triệu", value: "10to50" },
  { label: "Trên 50 triệu", value: "over50" },
];

// Sort options
const SORT_OPTIONS = [
  { label: "Tất cả", value: "default" },
  { label: "Giá tăng dần", value: "priceAsc" },
  { label: "Giá giảm dần", value: "priceDesc" },
  { label: "Ngày khởi hành gần nhất", value: "dateAsc" },
];

function getBudgetRange(value) {
  switch (value) {
    case "under5":
      return [0, 5000000];
    case "5to10":
      return [5000000, 10000000];
    case "10to50":
      return [10000000, 50000000];
    case "over50":
      return [50000000, Infinity];
    default:
      return [0, Infinity];
  }
}

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

function getFutureDates(dates, minDate) {
  return (dates || []).filter((d) => new Date(d) >= minDate);
}

const todayPlus3 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const userId = localStorage.getItem("userId");

  // Lọc từ params truyền qua
  const params = new URLSearchParams(location.search);
  const [budget, setBudget] = useState(params.get("budget") || "");
  const [departure, setDeparture] = useState(params.get("departure") || "");
  const [destination, setDestination] = useState(params.get("destination") || "");
  const [date, setDate] = useState(params.get("date") || "");
  const [duration, setDuration] = useState(params.get("duration") || "");
  const [sort, setSort] = useState("default");
  const [searchQuery, setSearchQuery] = useState(params.get("query") || "");

  // Đồng bộ state với URL params khi location thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBudget(params.get("budget") || "");
    setDeparture(params.get("departure") || "");
    setDestination(params.get("destination") || "");
    setDate(params.get("date") || "");
    setDuration(params.get("duration") || "");
    setSort(params.get("sort") || "default");
    setSearchQuery(params.get("query") || "");
  }, [location.search]);

  // Khi filter thay đổi thì cập nhật URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (budget) params.set("budget", budget);
    if (departure) params.set("departure", departure);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (duration) params.set("duration", duration);
    if (sort && sort !== "default") params.set("sort", sort);
    if (searchQuery) params.set("query", searchQuery);

    // Chỉ replace nếu khác với location.search hiện tại
    const newSearch = params.toString();
    const currentSearch = location.search.replace(/^\?/, "");
    if (newSearch !== currentSearch) {
      navigate(`/search${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
    // eslint-disable-next-line
  }, [budget, departure, destination, date, duration, sort, searchQuery]);

  // Dữ liệu tour từ API
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái yêu thích: { [tourRouteId]: favoriteId }
  const [favorites, setFavorites] = useState({});

  // Lấy danh sách tour từ API
  useEffect(() => {
    setLoading(true);
    fetchGet(
      "/api/admin/tour-route/search",
      (res) => {
        setTours(res.data || []);
        setLoading(false);
      },
      (fail)=>{
        console.error("Lỗi khi lấy danh sách tour:", fail);
        setTours([]);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  // Lấy danh sách tour yêu thích của user
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchGet(`/api/admin/favorite-tour/user/${userId}`, (res) => {
        const favMap = {};
        (res.data || []).forEach(fav => {
          favMap[fav.tourRouteId] = fav.id;
        });
        setFavorites(favMap);
      });
    }
  }, [isLoggedIn, userId]);

  // Lấy tất cả điểm đi/đến cho dropdown
  const departures = useMemo(
    () => [...new Set(tours.map((t) => t.departure))],
    [tours]
  );
  const destinations = useMemo(
    () => [...new Set(tours.map((t) => t.destination))],
    [tours]
  );

  // Lấy tất cả ngày hợp lệ cho date picker
  const allValidDates = useMemo(() => {
    const dates = new Set();
    tours.forEach((tour) =>
      getFutureDates(tour.startDates, todayPlus3()).forEach((d) => dates.add(d))
    );
    return Array.from(dates).sort();
  }, [tours]);

  // Lọc tour theo filter
  const filteredTours = useMemo(() => {
    let result = tours.map((tour) => {
      // Chỉ lấy ngày hợp lệ
      const validDates = getFutureDates(tour.startDates, todayPlus3());
      return { ...tour, validDates };
    });

    // Chỉ show tour còn ngày hợp lệ
    result = result.filter((tour) => tour.validDates.length > 0);

    // Lọc theo search query từ header - tìm kiếm trong nhiều trường
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter((tour) => {
        // Tìm kiếm trong tên tour, mã tour, điểm đi, điểm đến
        const searchFields = [
          tour.name || '',
          tour.code || '',
          tour.departure || '',
          tour.destination || ''
        ].map(field => field.toLowerCase());
        
        return searchFields.some(field => field.includes(queryLower));
      });
    }

    if (budget) {
      const [min, max] = getBudgetRange(budget);
      result = result.filter((tour) => tour.price >= min && tour.price <= max);
    }
    if (departure) {
      result = result.filter((tour) => tour.departure === departure);
    }
    if (destination) {
      result = result.filter((tour) => tour.destination === destination);
    }
    if (date) {
      result = result.filter((tour) =>
        tour.validDates.some((d) => d === date)
      );
    }
    if (duration) {
      result = result.filter(
        (tour) => String(tour.duration) === String(duration)
      );
    }

    // Sắp xếp
    if (sort === "priceAsc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "priceDesc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === "dateAsc") {
      result = [...result].sort(
        (a, b) => new Date(a.validDates[0]) - new Date(b.validDates[0])
      );
    }

    return result;
  }, [tours, budget, departure, destination, date, duration, sort, searchQuery]);

  // Xử lý chọn ngày với date picker
  function handleDateChange(e) {
    setDate(e.target.value);
  }

  // Xử lý favorite
  function toggleFavorite(tourRouteId) {
    if (!isLoggedIn || !userId) return;
    if (favorites[tourRouteId]) {
      // Đã tym, xóa
      fetchDelete(`/api/admin/favorite-tour/remove/${favorites[tourRouteId]}`, () => {
        setFavorites((prev) => {
          const newFav = { ...prev };
          delete newFav[tourRouteId];
          return newFav;
        });
      }, (error) => {
        console.error("Error removing favorite:", error);
      });
    } else {
      // Chưa tym, thêm
      fetchPost(
        "/api/admin/favorite-tour/add",
        { userID: Number(userId), tourRouteId: Number(tourRouteId) },
        (res) => {
          setFavorites((prev) => ({ ...prev, [tourRouteId]: res.data.id }));
        }
      );
    }
  }

  // Chuyển sang trang chi tiết tour
  function handleBookNow(tourId) {
    navigate(`/tour-detail/${tourId}`);
  }

  return (
    <div className="search-page">
      <div className="search-filter">
        <h3>BỘ LỌC TÌM KIẾM</h3>
        <div className="filter-group">
          <div className="filter-label">Ngân sách:</div>
          <div className="filter-budget">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                className={budget === b.value ? "active" : ""}
                onClick={() => setBudget(b.value)}
              >
                {b.label}
              </button>
            ))}
            {budget && (
              <button
                className="clear-btn"
                title="Xóa lọc ngân sách"
                onClick={() => setBudget("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="filter-group">
          <div className="filter-label">Điểm khởi hành:</div>
          <select
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          >
            <option value="">Tất cả</option>
            {departures.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <div className="filter-label">Điểm đến:</div>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Tất cả</option>
            {destinations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <div className="filter-label">Ngày đi:</div>
          <input
            type="date"
            value={date}
            min={allValidDates[0] || ""}
            max={allValidDates[allValidDates.length - 1] || ""}
            onChange={handleDateChange}
            className="date-picker"
          />
        </div>
        <div className="filter-group">
          <div className="filter-label">Thời gian:</div>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Tất cả</option>
            {[...new Set(tours.map((t) => t.duration))].map((d) => (
              <option key={d} value={d}>
                {d}N{d - 1}Đ
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="search-results">
        <div className="search-header">
          <h2>THÔNG TIN CÁC TOUR DU LỊCH PHÙ HỢP</h2>
          {searchQuery && (
            <div className="search-query-info">
              Kết quả tìm kiếm cho: "<strong>{searchQuery}</strong>"
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            </div>
          )}
          <div>
            Tìm thấy được{" "}
            <span className="search-count">{filteredTours.length}</span> kết quả
            phù hợp
          </div>
          <div className="search-sort">
            <span>Sắp xếp theo:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="tour-list">
          {loading && <div className="no-result">Đang tải dữ liệu...</div>}
          {!loading && filteredTours.length === 0 && (
            <div className="no-result">Không tìm thấy tour phù hợp.</div>
          )}
          {filteredTours.map((tour) => (
            <div className="tour-card" key={tour.id}>
              <div className="tour-img">
                <img
                  src={
                    tour.image?.startsWith("http")
                      ? tour.image
                      : `${BE_ENDPOINT}/${tour.image}`
                  }
                  alt={tour.name}
                />
                <button
                  className={`favorite-btn${favorites[tour.id] ? " active" : ""}`}
                  title="Yêu thích"
                  onClick={() => toggleFavorite(tour.id)}
                >
                  <span
                    role="img"
                    aria-label="heart"
                    style={{
                      color: favorites[tour.id] ? "#e53935" : "#bbb",
                      transition: "color 0.2s",
                      filter: favorites[tour.id]
                        ? "drop-shadow(0 0 4px #e5393533)"
                        : "none",
                    }}
                  >
                    ♥
                  </span>
                </button>
              </div>
              <div className="tour-info">
                <div className="tour-title">{tour.name}</div>
                <div className="tour-meta">
                  <div>
                    <b>Mã tour:</b> {tour.code}
                  </div>
                  <div>
                    <b>Thời gian:</b> {tour.duration}N{tour.nights}Đ
                  </div>
                  <div>
                    <b>Khởi hành:</b> {tour.departure}
                  </div>
                  <div>
                    <b>Điểm đến:</b> {tour.destination}
                  </div>
                  <div>
                    <b>Ngày khởi hành:</b>{" "}
                    {tour.validDates.slice(0, 3).map((d) => (
                      <span className="tour-date" key={d}>
                        {formatDate(d)}
                      </span>
                    ))}
                    {tour.validDates.length > 3 && (
                      <span className="tour-date more-date">
                        +{tour.validDates.length - 3} ngày khác
                      </span>
                    )}
                  </div>
                </div>
                <div className="tour-bottom">
                  <div className="tour-price">
                    Giá từ: <span>{formatCurrency(tour.price)}</span>
                  </div>
                  <button className="book-btn" onClick={() => handleBookNow(tour.id)}>
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}