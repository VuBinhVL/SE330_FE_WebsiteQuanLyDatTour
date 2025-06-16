import React, { useEffect, useState } from "react";
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

// Helper: Lấy tháng của tuần trong năm (chuẩn cho mọi quý)
function getMonthOfWeek(week, quarter) {
  // Quý 1: tuần 1-4: tháng 1, 5-8: tháng 2, 9-13: tháng 3
  // Quý 2: tuần 14-17: tháng 4, 18-21: tháng 5, 22-26: tháng 6
  // Quý 3: tuần 27-30: tháng 7, 31-34: tháng 8, 35-39: tháng 9
  // Quý 4: tuần 40-43: tháng 10, 44-47: tháng 11, 48-52: tháng 12
  let month = 1;
  if (quarter === 1) {
    if (week >= 1 && week <= 4) month = 1;
    else if (week >= 5 && week <= 8) month = 2;
    else month = 3;
  } else if (quarter === 2) {
    if (week >= 14 && week <= 17) month = 4;
    else if (week >= 18 && week <= 21) month = 5;
    else month = 6;
  } else if (quarter === 3) {
    if (week >= 27 && week <= 30) month = 7;
    else if (week >= 31 && week <= 34) month = 8;
    else month = 9;
  } else if (quarter === 4) {
    if (week >= 40 && week <= 43) month = 10;
    else if (week >= 44 && week <= 47) month = 11;
    else month = 12;
  }
  return month;
}

export default function Report() {
  const [quarter, setQuarter] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // MOCK DATA cho từng quý
    let mockData = [];
    if (quarter === 1) {
      mockData = [
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
    } else if (quarter === 2) {
      mockData = [
        { week: 14, revenue: 18000000, bookings: 21 },
        { week: 15, revenue: 19000000, bookings: 23 },
        { week: 16, revenue: 20000000, bookings: 25 },
        { week: 17, revenue: 21000000, bookings: 27 },
        { week: 18, revenue: 22000000, bookings: 29 },
        { week: 19, revenue: 23000000, bookings: 31 },
        { week: 20, revenue: 24000000, bookings: 33 },
        { week: 21, revenue: 25000000, bookings: 35 },
        { week: 22, revenue: 26000000, bookings: 37 },
        { week: 23, revenue: 27000000, bookings: 39 },
        { week: 24, revenue: 28000000, bookings: 41 },
        { week: 25, revenue: 29000000, bookings: 43 },
        { week: 26, revenue: 30000000, bookings: 45 }
      ];
    } else if (quarter === 3) {
      mockData = [
        { week: 27, revenue: 31000000, bookings: 22 },
        { week: 28, revenue: 32000000, bookings: 24 },
        { week: 29, revenue: 33000000, bookings: 26 },
        { week: 30, revenue: 34000000, bookings: 28 },
        { week: 31, revenue: 35000000, bookings: 30 },
        { week: 32, revenue: 36000000, bookings: 32 },
        { week: 33, revenue: 37000000, bookings: 34 },
        { week: 34, revenue: 38000000, bookings: 36 },
        { week: 35, revenue: 39000000, bookings: 38 },
        { week: 36, revenue: 40000000, bookings: 40 },
        { week: 37, revenue: 41000000, bookings: 42 },
        { week: 38, revenue: 42000000, bookings: 44 },
        { week: 39, revenue: 43000000, bookings: 46 }
      ];
    } else if (quarter === 4) {
      mockData = [
        { week: 40, revenue: 44000000, bookings: 23 },
        { week: 41, revenue: 45000000, bookings: 25 },
        { week: 42, revenue: 46000000, bookings: 27 },
        { week: 43, revenue: 47000000, bookings: 29 },
        { week: 44, revenue: 48000000, bookings: 31 },
        { week: 45, revenue: 49000000, bookings: 33 },
        { week: 46, revenue: 50000000, bookings: 35 },
        { week: 47, revenue: 51000000, bookings: 37 },
        { week: 48, revenue: 52000000, bookings: 39 },
        { week: 49, revenue: 53000000, bookings: 41 },
        { week: 50, revenue: 54000000, bookings: 43 },
        { week: 51, revenue: 55000000, bookings: 45 },
        { week: 52, revenue: 56000000, bookings: 47 }
      ];
    }
    setTimeout(() => {
      setData(mockData);
      setSelectedWeek(null);
      setLoading(false);
    }, 700);
  }, [quarter, year]);

  // Xác định tuần đang chọn, nếu không chọn thì mặc định tuần đầu tiên của quý
  const weekToShow = selectedWeek || data[0];

  // Xác định tháng của tuần đang chọn
  const selectedMonth = weekToShow
    ? getMonthOfWeek(weekToShow.week, quarter)
    : getMonthOfWeek(data[0]?.week || 1, quarter);

  // Lọc các tuần thuộc tháng đang chọn
  const weeksInMonth = data.filter(
    (item) => getMonthOfWeek(item.week, quarter) === selectedMonth
  );

  // Pie chart: tỉ lệ doanh thu các tuần trong tháng đang chọn
  const pieData = weeksInMonth.map((item) => ({
    name: `Tuần ${item.week}`,
    value: item.revenue,
  }));

  // Xuất báo cáo (giả lập)
  const handleExport = (type) => {
    alert(`Xuất báo cáo dạng ${type.toUpperCase()} (chưa xử lý)`);
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
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload) {
                  setSelectedWeek(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" label={{ value: "Tuần", position: "insideBottom", offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: "Doanh thu (VNĐ)", angle: -90, position: "insideLeft", offset: -35}} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Số lượt đặt", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#5a3ea6" name="Doanh thu" />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#C34141" name="Số lượt đặt" />
            </BarChart>
          </ResponsiveContainer>

          <div className="report-details">
            <div className="report-table-container">
              <h3>
                Doanh thu & số lượng đặt tour các tuần trong tháng {selectedMonth}
              </h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Tuần</th>
                    <th>Doanh thu (VNĐ)</th>
                    <th>Số lượt đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {weeksInMonth.map((item) => (
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
                Tỉ lệ doanh thu các tuần trong tháng {selectedMonth}
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