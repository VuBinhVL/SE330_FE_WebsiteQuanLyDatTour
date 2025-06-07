import React, { useEffect, useState, useMemo } from "react";
import "./Search.css";

// Fake API data
const FAKE_TOURS = [
  {
    id: 1,
    name: "Mông cổ",
    code: "DNSG838",
    duration: 5,
    nights: 4,
    price: 8189000,
    departure: "TP. Hồ Chí Minh",
    destination: "Đà Nẵng",
    startDates: [
      "2025-04-15",
      "2025-04-20",
      "2025-05-01",
      "2025-06-01",
      "2025-06-10",
    ],
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Mông c",
    code: "DNSG838",
    duration: 5,
    nights: 4,
    price: 8189000,
    departure: "TP. Hồ Chí Minh",
    destination: "Đà Nẵng",
    startDates: [
      "2025-04-16",
      "2025-04-25",
      "2025-05-05",
      "2025-06-05",
      "2025-06-15",
    ],
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Đà Nẵng - Phố cổ Hội An - Bà Nà Hill - Con đường ký ức",
    code: "DNSG838",
    duration: 5,
    nights: 4,
    price: 8189000,
    departure: "TP. Hồ Chí Minh",
    destination: "Đà Nẵng",
    startDates: [
      "2025-04-18",
      "2025-04-28",
      "2025-05-10",
      "2025-06-08",
      "2025-06-18",
    ],
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  // Add more tours as needed
];

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
  return num.toLocaleString("vi-VN") + " đ";
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
  return dates.filter((d) => new Date(d) >= minDate);
}

const todayPlus3 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function Search() {
  // Filter states
  const [budget, setBudget] = useState("");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [sort, setSort] = useState("default");

  // Fake API fetch
  const [tours, setTours] = useState([]);
  useEffect(() => {
    setTimeout(() => setTours(FAKE_TOURS), 500);
  }, []);

  // Get all unique departures/destinations for filter dropdowns
  const departures = useMemo(
    () => [...new Set(FAKE_TOURS.map((t) => t.departure))],
    []
  );
  const destinations = useMemo(
    () => [...new Set(FAKE_TOURS.map((t) => t.destination))],
    []
  );

  // Filtering logic
  const filteredTours = useMemo(() => {
    let result = tours.map((tour) => {
      // Only keep startDates after today+3
      const validDates = getFutureDates(tour.startDates, todayPlus3());
      return { ...tour, validDates };
    });

    // Only show tours with at least one valid date
    result = result.filter((tour) => tour.validDates.length > 0);

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
        (tour) => tour.duration === parseInt(duration, 10)
      );
    }

    // Sorting
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
  }, [tours, budget, departure, destination, date, duration, sort]);

  // For date picker, show all valid dates from all tours
  const allValidDates = useMemo(() => {
    const dates = new Set();
    tours.forEach((tour) =>
      getFutureDates(tour.startDates, todayPlus3()).forEach((d) => dates.add(d))
    );
    return Array.from(dates).sort();
  }, [tours]);

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
          <select value={date} onChange={(e) => setDate(e.target.value)}>
            <option value="">Tất cả</option>
            {allValidDates.map((d) => (
              <option key={d} value={d}>
                {formatDate(d)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <div className="filter-label">Thời gian:</div>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Tất cả</option>
            {[...new Set(FAKE_TOURS.map((t) => t.duration))].map((d) => (
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
          {filteredTours.length === 0 && (
            <div className="no-result">Không tìm thấy tour phù hợp.</div>
          )}
          {filteredTours.map((tour) => (
            <div className="tour-card" key={tour.id}>
              <div className="tour-img">
                <img src={tour.image} alt={tour.name} />
                <button className="favorite-btn" title="Yêu thích">
                  <span role="img" aria-label="heart">
                    🤍
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
                    {tour.validDates.map((d) => (
                      <span className="tour-date" key={d}>
                        {formatDate(d)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="tour-bottom">
                  <div className="tour-price">
                    Giá từ: <span>{formatCurrency(tour.price)}</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}