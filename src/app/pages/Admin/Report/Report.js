import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import "./Report.css";

const COLORS = [
  "#4CAF50", "#FF9800", "#2196F3", "#e62490", "#bf1d74",
  "#f582c2", "#5a3ea6", "#C34141", "#E7C8C8", "#FFD700",
  "#00BFFF", "#FF69B4", "#8A2BE2"
];

const QUARTERS = [
  { value: 1, label: "Quý 1 (Tuần 1-13)" },
  { value: 2, label: "Quý 2 (Tuần 14-26)" },
  { value: 3, label: "Quý 3 (Tuần 27-39)" },
  { value: 4, label: "Quý 4 (Tuần 40-52)" },
];

// API mẫu trả về (ví dụ):
// [
//   { "week": 1, "revenue": 10000000, "bookings": 20 },
//   { "week": 2, "revenue": 12000000, "bookings": 25 },
//   ...
// ]

export default function Report() {
  const [quarter, setQuarter] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   setLoading(true);
  //   setError(null);
  //   // Thay bằng API thực tế của bạn
  //   axios
  //     .get(
  //       `http://localhost:8081/api/admin/report/revenue-booking?quarter=${quarter}&year=${year}`
  //     )
  //     .then((res) => {
  //       // res.data.data là mảng 13 tuần, mỗi tuần: { week: 1, revenue: ..., bookings: ... }
  //       setData(res.data.data || []);
  //       setSelectedWeek(null);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setError("Không thể tải dữ liệu báo cáo");
  //       setLoading(false);
  //     });
  // }, [quarter, year]);
  useEffect(() => {
  setLoading(true);
  setError(null);

  // MOCK DATA
  const mockData = [
    { week: 1, revenue: 10000000, bookings: 20 },
    { week: 2, revenue: 12000000, bookings: 25 },
    { week: 3, revenue: 9000000, bookings: 18 },
    { week: 4, revenue: 15000000, bookings: 30 },
    { week: 5, revenue: 11000000, bookings: 22 },
    { week: 6, revenue: 13000000, bookings: 27 },
    { week: 7, revenue: 14000000, bookings: 29 },
    { week: 8, revenue: 12500000, bookings: 24 },
    { week: 9, revenue: 13500000, bookings: 26 },
    { week: 10, revenue: 14500000, bookings: 28 },
    { week: 11, revenue: 15500000, bookings: 32 },
    { week: 12, revenue: 16000000, bookings: 34 },
    { week: 13, revenue: 17000000, bookings: 36 }
  ];

  setTimeout(() => {
    setData(mockData);
    setSelectedWeek(null);
    setLoading(false);
  }, 700); // giả lập delay API
}, [quarter, year]);

  // Dữ liệu cho PieChart
  const pieData = selectedWeek
    ? [
        {
          name: `Tuần ${selectedWeek.week}`,
          value: selectedWeek.revenue,
        },
      ]
    : data.map((item) => ({
        name: `Tuần ${item.week}`,
        value: item.revenue,
      }));

  // Xuất báo cáo (giả lập)
  const handleExport = (type) => {
    alert(`Xuất báo cáo dạng ${type.toUpperCase()} (chưa xử lý)`);
    // Ví dụ dùng file-saver:
    // axios.get('/api/export', { responseType: 'blob' }).then(res => {
    //   saveAs(new Blob([res.data]), `report.${type}`);
    // });
  };

  return (
    <div className="report-container">
      <h1>Báo cáo doanh thu & số lượng đặt tour theo quý</h1>
      <div className="report-controls">
        <label>
          Năm:
          <input
            type="number"
            value={year}
            min={2000}
            max={2100}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label>
          Quý:
          <select
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value))}
          >
            {QUARTERS.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => handleExport("pdf")}>Xuất PDF</button>
        <button onClick={() => handleExport("xlsx")}>Xuất Excel</button>
      </div>

      {loading ? (
        <div className="report-loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="report-error">{error}</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload) {
                  setSelectedWeek(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" label={{ value: "Tuần", position: "insideBottom", offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: "Doanh thu (VNĐ)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Số lượt đặt", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#5a3ea6" name="Doanh thu" />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#C34141" name="Số lượt đặt" />
            </BarChart>
          </ResponsiveContainer>

          <div className="report-details">
            <div className="report-table-container">
              <h3>Chi tiết doanh thu & số lượng đặt tour theo tuần</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Tuần</th>
                    <th>Doanh thu (VNĐ)</th>
                    <th>Số lượt đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item.week}
                      className={selectedWeek && selectedWeek.week === item.week ? "selected" : ""}
                      onClick={() => setSelectedWeek(item)}
                    >
                      <td>{item.week}</td>
                      <td>{item.revenue.toLocaleString("vi-VN")}</td>
                      <td>{item.bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-pie-container">
              <h3>
                {selectedWeek
                  ? `Tỉ lệ doanh thu tuần ${selectedWeek.week}`
                  : "Tỉ lệ doanh thu các tuần trong quý"}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#5a3ea6"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}