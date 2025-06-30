import React, { useState, useContext, useEffect } from "react";
import { AdminTitleContext } from "../../../layouts/adminLayout/AdminLayout/AdminLayout";
import {
  Area,
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
  ComposedChart,
} from "recharts";
import { fetchGet } from "../../../lib/httpHandler";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import "./Report.css";

const COLORS = [
  "#8B0000", "#B91C1C", "#DC2626", "#7F1D1D", "#991B1B", 
  "#7C2D12", "#92400E", "#A0522D", "#8B4513", "#654321",
  "#5D4037", "#6D4C41", "#8D6E63", "#A1887F", "#BCAAA4"
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

// Helper: Lấy tuần của năm từ ngày
function getWeekOfYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper: Lấy quý từ tuần
function getQuarterFromWeek(week) {
  if (week >= 1 && week <= 13) return 1;
  if (week >= 14 && week <= 26) return 2;
  if (week >= 27 && week <= 39) return 3;
  if (week >= 40 && week <= 52) return 4;
  return 1;
}

// Helper: Lấy quý và tuần hiện tại
function getCurrentQuarterAndWeek() {
  const now = new Date();
  const week = getWeekOfYear(now);
  const quarter = getQuarterFromWeek(week);
  return { quarter, week };
}

// Helper: Xử lý dữ liệu từ API thành format cho chart
function processInvoiceData(invoices, selectedQuarter, selectedYear) {
  // Khởi tạo dữ liệu cho tất cả tuần trong quý
  const startWeek = (selectedQuarter - 1) * 13 + 1;
  const endWeek = selectedQuarter * 13;
  const weeklyData = {};
  
  for (let week = startWeek; week <= endWeek; week++) {
    weeklyData[week] = {
      week,
      revenue: 0,
      bookings: 0
    };
  }

  // Xử lý từng invoice
  invoices.forEach(invoice => {
    const createdDate = new Date(invoice.createdAt);
    if (createdDate.getFullYear() !== selectedYear) return;
    
    const week = getWeekOfYear(createdDate);
    const quarter = getQuarterFromWeek(week);
    
    if (quarter === selectedQuarter && weeklyData[week]) {
      weeklyData[week].revenue += invoice.totalAmount;
      weeklyData[week].bookings += 1;
    }
  });

  return Object.values(weeklyData);
}

export default function Report() {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle("Báo cáo doanh thu & số lượng đặt tour");
    setSubtitle("Xem báo cáo doanh thu và số lượng đặt tour theo quý");
  }, [setTitle, setSubtitle]);

  const currentQuarterInfo = getCurrentQuarterAndWeek();
  const [quarter, setQuarter] = useState(currentQuarterInfo.quarter);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawInvoices, setRawInvoices] = useState([]); // Store raw invoice data

  // Hàm xuất Excel
  const exportToExcel = async () => {
    try {
      // Hiển thị loading
      const loadingMessage = document.createElement('div');
      loadingMessage.innerHTML = '📊 Dang tao file Excel...';
      loadingMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(loadingMessage);
      
      // Timeout safety
      setTimeout(() => {
        const loadingEl = document.querySelector('div[style*="position: fixed"]');
        if (loadingEl && document.body.contains(loadingEl)) {
          document.body.removeChild(loadingEl);
          alert('❌ Xuat Excel bi timeout. Vui long thu lai sau.');
        }
      }, 30000); // 30 seconds timeout for Excel
      
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Tổng quan
      const overviewData = [
        ['BÁO CÁO TỔNG QUAN'],
        [`Quý ${quarter} năm ${year}`],
        [`Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`],
        [],
        ['THỐNG KÊ CHÍNH'],
        ['Chỉ số', 'Giá trị', 'Đơn vị'],
        ['Tổng doanh thu', totalRevenue, 'VNĐ'],
        ['Tổng lượt đặt', totalBookings, 'Lượt'],
        ['Doanh thu TB/tuần', safeAverageRevenuePerWeek, 'VNĐ'],
        ['Lượt đặt TB/tuần', Math.round(safeAverageBookingsPerWeek), 'Lượt'],
        ['Doanh thu/lượt đặt', safeAverageRevenuePerBooking, 'VNĐ'],
        ['Tuần đỉnh cao', `Tuần ${maxRevenueWeek?.week || 'N/A'}`, `${maxRevenueWeek?.revenue?.toLocaleString("vi-VN") || 0} VNĐ`]
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
      
      // Styling cho sheet tổng quan
      ws1['!cols'] = [
        { width: 25 },
        { width: 20 },
        { width: 15 }
      ];
      
      // Styling cho các cell
      if (ws1['A1']) ws1['A1'].s = { font: { bold: true, sz: 14 } };
      if (ws1['A2']) ws1['A2'].s = { font: { bold: true, sz: 12 } };
      if (ws1['A5']) ws1['A5'].s = { font: { bold: true, sz: 12 } };
      
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
      
      // Sheet 2: Chi tiết theo tuần
      const weeklyHeaders = ['Tuần', 'Doanh thu (VNĐ)', 'Lượt đặt', 'Trung bình/Lượt đặt (VNĐ)', 'Tháng'];
      const weeklyData = data.map(item => [
        `Tuần ${item.week}`,
        item.revenue,
        item.bookings,
        item.bookings > 0 ? Math.round(item.revenue / item.bookings) : 0,
        `Tháng ${getMonthOfWeek(item.week, quarter)}`
      ]);
      
      // Thêm tổng cộng
      const totalWeeklyRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
      const totalWeeklyBookings = data.reduce((sum, item) => sum + item.bookings, 0);
      const avgWeeklyRevenue = totalWeeklyBookings > 0 ? totalWeeklyRevenue / totalWeeklyBookings : 0;
      
      weeklyData.push([
        'TỔNG CỘNG',
        totalWeeklyRevenue,
        totalWeeklyBookings,
        Math.round(avgWeeklyRevenue),
        `Quý ${quarter}`
      ]);
      
      const ws2 = XLSX.utils.aoa_to_sheet([
        [`CHI TIẾT THEO TUẦN - QUÝ ${quarter} NĂM ${year}`],
        [],
        weeklyHeaders,
        ...weeklyData
      ]);
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiết theo tuần');
      
      // Sheet 3: Thống kê thanh toán (nếu có)
      if (finalPaymentStatusData.length > 0) {
        const paymentHeaders = ['Trạng thái', 'Số lượng', 'Tỷ lệ (%)', 'Doanh thu ước tính (VNĐ)'];
        const paymentData = finalPaymentStatusData.map(item => {
          const total = finalPaymentStatusData.reduce((sum, p) => sum + p.value, 0);
          const percentage = total > 0 ? (item.value / total * 100).toFixed(1) : 0;
          
          // Ước tính doanh thu dựa trên tỷ lệ
          let estimatedRevenue = 0;
          if (item.name === 'Da thanh toan') {
            estimatedRevenue = paidRevenue || (totalRevenue * 0.75);
          } else {
            estimatedRevenue = unpaidRevenue || (totalRevenue * 0.25);
          }
          
          return [
            item.name, 
            item.value, 
            `${percentage}%`,
            Math.round(estimatedRevenue)
          ];
        });
        
        const ws3 = XLSX.utils.aoa_to_sheet([
          [`THỐNG KÊ THANH TOÁN - QUÝ ${quarter} NĂM ${year}`],
          [`Cập nhật: ${new Date().toLocaleDateString('vi-VN')}`],
          [],
          paymentHeaders,
          ...paymentData,
          [],
          ['Ghi chú:', 'Doanh thu ước tính dựa trên dữ liệu hóa đơn hiện có']
        ]);
        XLSX.utils.book_append_sheet(wb, ws3, 'Thống kê thanh toán');
      }
      
      // Sheet 4: Phương thức thanh toán (nếu có)
      if (paymentMethodChartData.length > 0) {
        const methodHeaders = ['Phương thức', 'Số giao dịch', 'Tỷ lệ (%)', 'Doanh thu (VNĐ)'];
        const methodData = paymentMethodChartData.map(method => {
          const total = paymentMethodChartData.reduce((sum, m) => sum + m.value, 0);
          const percentage = total > 0 ? (method.value / total * 100).toFixed(1) : 0;
          return [
            method.name,
            method.value,
            `${percentage}%`,
            method.revenue || 0
          ];
        });
        
        // Tổng cộng phương thức thanh toán
        methodData.push([
          'TỔNG CỘNG',
          paymentMethodChartData.reduce((sum, m) => sum + m.value, 0),
          '100%',
          paymentMethodChartData.reduce((sum, m) => sum + (m.revenue || 0), 0)
        ]);
        
        const ws4 = XLSX.utils.aoa_to_sheet([
          [`PHƯƠNG THỨC THANH TOÁN - QUÝ ${quarter} NĂM ${year}`],
          [],
          methodHeaders,
          ...methodData
        ]);
        XLSX.utils.book_append_sheet(wb, ws4, 'Phương thức thanh toán');
      }
      
      // Sheet 5: Dữ liệu thô cho phân tích
      if (data.length > 0) {
        const rawHeaders = ['Tuần', 'Tháng', 'Quý', 'Năm', 'Doanh thu (VNĐ)', 'Lượt đặt', 'Doanh thu/Lượt đặt'];
        const rawData = data.map(item => [
          item.week,
          getMonthOfWeek(item.week, quarter),
          quarter,
          year,
          item.revenue,
          item.bookings,
          item.bookings > 0 ? (item.revenue / item.bookings) : 0
        ]);
        
        const ws5 = XLSX.utils.aoa_to_sheet([
          ['DỮ LIỆU THÔ CHO PHÂN TÍCH'],
          [`Xuất ngày: ${new Date().toISOString()}`],
          [],
          rawHeaders,
          ...rawData
        ]);
        XLSX.utils.book_append_sheet(wb, ws5, 'Dữ liệu thô');
      }
      
      // Xóa loading message
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }
      
      // Lưu file với tên chi tiết hơn
      const fileName = `BaoCao_Excel_Quy${quarter}_${year}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      // Xóa loading message nếu có lỗi
      const loadingMessage = document.querySelector('div[style*="position: fixed"]');
      if (loadingMessage && document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }
      
      console.error('Error exporting to Excel:', error);
      alert('❌ Co loi xay ra khi xuat Excel. Vui long thu lai.');
    }
  };

  // Ham xuat PDF voi bieu do duoc cai thien
  const exportToPDF = async () => {
    try {
      // Hien thi loading voi timeout safety
      const loadingMessage = document.createElement('div');
      loadingMessage.innerHTML = '📊 Dang tao file PDF... Vui long cho';
      loadingMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3B82F6;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(loadingMessage);
      
      // Timeout de dam bao khong bi treo
      setTimeout(() => {
        const loadingEl = document.querySelector('div[style*="position: fixed"]');
        if (loadingEl && document.body.contains(loadingEl)) {
          document.body.removeChild(loadingEl);
          alert('❌ Xuat PDF bi timeout. Vui long thu lai sau.');
        }
      }, 30000); // 30 seconds timeout
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      
      // Thiet lap font co ban
      pdf.setFont('times');
      
      // Tieu de - khong dau
      pdf.setFontSize(18);
      pdf.text('BAO CAO DOANH SO & THONG KE DAT TOUR', 105, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.text(`Bao cao quy ${quarter} nam ${year}`, 105, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Thong ke tong quan - khong dau
      pdf.setFontSize(12);
      pdf.text('THONG KE TONG QUAN', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      const summaryItems = [
        `Tong doanh thu: ${totalRevenue.toLocaleString("vi-VN")} VND`,
        `Tong so luot dat: ${totalBookings} luot`,
        `Doanh thu trung binh/tuan: ${safeAverageRevenuePerWeek.toLocaleString("vi-VN")} VND`,
        `So luot dat trung binh/tuan: ${Math.round(safeAverageBookingsPerWeek)} luot`,
        `Doanh thu trung binh/luot dat: ${safeAverageRevenuePerBooking.toLocaleString("vi-VN")} VND`,
        `Tuan co doanh thu cao nhat: Tuan ${maxRevenueWeek?.week || 'N/A'} - ${maxRevenueWeek?.revenue?.toLocaleString("vi-VN") || 0} VND`
      ];
      
      summaryItems.forEach((text, index) => {
        pdf.text(text, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
      
      // Capture bieu do chinh voi cai thien
      try {
        const chartElement = document.querySelector('.chart-container .recharts-wrapper');
        if (chartElement) {
          console.log('Tim thay bieu do chinh, dang capture...');
          
          // Doi de dam bao bieu do da render hoan toan
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const chartCanvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 1.0, // Giam scale de tranh memory issues
            useCORS: true,
            allowTaint: true,
            logging: true, // Enable logging de debug
            width: chartElement.offsetWidth,
            height: chartElement.offsetHeight
          });
          
          const chartImgData = chartCanvas.toDataURL('image/png', 0.8);
          const chartWidth = 160; // width in mm
          const chartHeight = Math.min((chartCanvas.height * chartWidth) / chartCanvas.width, 80); // Limit height
          
          // Kiem tra neu can trang moi
          if (yPosition + chartHeight > 230) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(12);
          pdf.text('BIEU DO DOANH SO VA SO LUOT DAT THEO TUAN', 20, yPosition);
          yPosition += 10;
          
          pdf.addImage(chartImgData, 'PNG', 20, yPosition, chartWidth, chartHeight);
          yPosition += chartHeight + 15;
          
          console.log('Da them bieu do chinh vao PDF');
        } else {
          console.warn('Khong tim thay bieu do chinh');
          pdf.setFontSize(10);
          pdf.text('(Khong tim thay bieu do chinh)', 20, yPosition);
          yPosition += 10;
        }
      } catch (chartError) {
        console.error('Loi khi capture bieu do chinh:', chartError);
        pdf.setFontSize(10);
        pdf.text('(Loi khi capture bieu do chinh)', 20, yPosition);
        yPosition += 10;
      }
      
      // Kiem tra neu can trang moi cho bang
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Bang chi tiet - thay the autoTable bang text don gian - khong dau
      pdf.setFontSize(12);
      pdf.text('CHI TIET THEO TUAN', 20, yPosition);
      yPosition += 15;
      
      // Header bang - khong dau
      pdf.setFontSize(8);
      pdf.text('Tuan', 20, yPosition);
      pdf.text('Doanh so (VND)', 50, yPosition);
      pdf.text('So luot', 100, yPosition);
      pdf.text('TB/Luot', 130, yPosition);
      pdf.text('Thang', 170, yPosition);
      yPosition += 8;
      
      // Du lieu bang
      data.forEach(item => {
        pdf.text(`Tuan ${item.week}`, 20, yPosition);
        pdf.text(item.revenue.toLocaleString("vi-VN"), 50, yPosition);
        pdf.text(item.bookings.toString(), 100, yPosition);
        pdf.text(item.bookings > 0 ? Math.round(item.revenue / item.bookings).toLocaleString("vi-VN") : '0', 130, yPosition);
        pdf.text(`Thang ${getMonthOfWeek(item.week, quarter)}`, 170, yPosition);
        yPosition += 6;
        
        // Kiem tra neu can trang moi
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      yPosition += 15;
      
      // Thong ke thanh toan - khong dau
      if (finalPaymentStatusData.length > 0) {
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Thong ke thanh toan - thay the autoTable
        pdf.setFontSize(12);
        pdf.text('THONG KE THANH TOAN', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(8);
        pdf.text('Trang thai', 20, yPosition);
        pdf.text('So luong', 80, yPosition);
        pdf.text('Ty le (%)', 130, yPosition);
        yPosition += 8;
        
        finalPaymentStatusData.forEach(item => {
          const total = finalPaymentStatusData.reduce((sum, p) => sum + p.value, 0);
          const percentage = total > 0 ? (item.value / total * 100).toFixed(1) : 0;
          
          pdf.text(item.name, 20, yPosition);
          pdf.text(item.value.toString(), 80, yPosition);
          pdf.text(`${percentage}%`, 130, yPosition);
          yPosition += 6;
        });
        
        yPosition += 15;
      }
      
      // Capture pie charts voi xu ly loi tot hon
      console.log('Bat dau capture pie charts...');
      const pieChartSelectors = [
        { selector: '.report-pie-container .recharts-wrapper', title: 'Ty le doanh thu theo tuan' },
        { selector: '.payment-status-container .recharts-wrapper', title: 'Ty le thanh toan' }
      ];
      
      let chartsAdded = 0;
      for (const chartInfo of pieChartSelectors) {
        try {
          const pieElement = document.querySelector(chartInfo.selector);
          console.log(`Dang tim ${chartInfo.title}:`, pieElement ? 'Tim thay' : 'Khong tim thay');
          
          if (pieElement) {
            // Kiem tra neu can trang moi
            if (yPosition > 180) {
              pdf.addPage();
              yPosition = 20;
            }
            
            // Doi de dam bao render
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const pieCanvas = await html2canvas(pieElement, {
              backgroundColor: '#ffffff',
              scale: 1.0, // Giam scale
              useCORS: true,
              allowTaint: true,
              logging: true,
              width: pieElement.offsetWidth,
              height: pieElement.offsetHeight
            });
            
            const pieImgData = pieCanvas.toDataURL('image/png', 0.8);
            const pieWidth = 70;
            const pieHeight = Math.min((pieCanvas.height * pieWidth) / pieCanvas.width, 70); // Limit height
            
            const xPosition = chartsAdded === 0 ? 20 : 110;
            
            if (chartsAdded === 0) {
              pdf.setFontSize(10);
              pdf.text('Bieu do ty le:', 20, yPosition);
              yPosition += 7;
            }
            
            pdf.addImage(pieImgData, 'PNG', xPosition, yPosition, pieWidth, pieHeight);
            console.log(`Da them ${chartInfo.title} vao PDF`);
            
            chartsAdded++;
            if (chartsAdded === 2) {
              yPosition += pieHeight + 15;
            }
          }
        } catch (pieError) {
          console.error(`Loi khi capture ${chartInfo.title}:`, pieError);
          pdf.setFontSize(8);
          pdf.text(`(Loi: ${chartInfo.title})`, 20, yPosition);
          yPosition += 6;
        }
      }
      
      console.log(`Da them ${chartsAdded} pie charts vao PDF`);
      
      // Payment method chart neu co - khong dau
      if (paymentMethodChartData.length > 0) {
        try {
          const methodElement = document.querySelector('.payment-method-container .recharts-wrapper');
          if (methodElement) {
            if (yPosition > 200) {
              pdf.addPage();
              yPosition = 20;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const methodCanvas = await html2canvas(methodElement, {
              backgroundColor: '#ffffff',
              scale: 1.2,
              useCORS: true,
              allowTaint: true,
              logging: false
            });
            
            const methodImgData = methodCanvas.toDataURL('image/png', 0.8);
            const methodWidth = 100;
            const methodHeight = Math.min((methodCanvas.height * methodWidth) / methodCanvas.width, 80);
            
            pdf.setFontSize(12);
            pdf.text('PHUONG THUC THANH TOAN', 20, yPosition);
            yPosition += 10;
            
            pdf.addImage(methodImgData, 'PNG', 55, yPosition, methodWidth, methodHeight);
            yPosition += methodHeight + 10;
            
            // Bang phuong thuc thanh toan - thay the autoTable - khong dau
            pdf.setFontSize(8);
            pdf.text('Phuong thuc', 20, yPosition);
            pdf.text('So giao dich', 80, yPosition);
            pdf.text('Doanh so (VND)', 130, yPosition);
            yPosition += 8;
            
            paymentMethodChartData.forEach(method => {
              pdf.text(method.name, 20, yPosition);
              pdf.text(method.value.toString(), 80, yPosition);
              pdf.text(method.revenue ? method.revenue.toLocaleString("vi-VN") : 'N/A', 130, yPosition);
              yPosition += 6;
            });
          }
        } catch (methodError) {
          console.error('Loi khi capture bieu do phuong thuc thanh toan:', methodError);
        }
      }
      
      // Footer cho tat ca cac trang - khong dau
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Tao ngay: ${new Date().toLocaleDateString('vi-VN')}`, 20, 285);
        pdf.text('Website Quan ly Dat Tour', 130, 285);
        pdf.text(`Trang ${i}/${pageCount}`, 180, 290);
      }
      
      // Xóa loading message
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }
      
      // Lưu file - chi luu khong thong bao
      try {
        const fileName = `BaoCao_PDF_Quy${quarter}_${year}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
      } catch (saveError) {
        console.error('Loi khi luu PDF:', saveError);
        throw new Error('Khong the luu file PDF. Vui long thu lai.');
      }
      
    } catch (error) {
      // Cleanup loading message
      const loadingMessageCleanup = document.querySelector('div[style*="position: fixed"]');
      if (loadingMessageCleanup && document.body.contains(loadingMessageCleanup)) {
        document.body.removeChild(loadingMessageCleanup);
      }
      
      console.error('Error exporting to PDF:', error);
      alert('❌ Co loi xay ra khi xuat PDF. Vui long thu lai.');
    }
  };

  // Tính toán các thống kê tổng quan (tránh NaN)
  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalBookings = data.reduce((sum, item) => sum + (item.bookings || 0), 0);
  const averageRevenuePerWeek = data.length > 0 ? totalRevenue / data.length : 0;
  const averageBookingsPerWeek = data.length > 0 ? totalBookings / data.length : 0;
  const averageRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Đảm bảo không có NaN trong các thống kê
  const safeAverageRevenuePerWeek = isNaN(averageRevenuePerWeek) ? 0 : averageRevenuePerWeek;
  const safeAverageBookingsPerWeek = isNaN(averageBookingsPerWeek) ? 0 : averageBookingsPerWeek;
  const safeAverageRevenuePerBooking = isNaN(averageRevenuePerBooking) ? 0 : averageRevenuePerBooking;

  // Tìm tuần có doanh thu cao nhất
  const maxRevenueWeek = data.reduce((max, item) => item.revenue > max.revenue ? item : max, data[0] || {});

  // Tính toán payment status từ raw invoices data
  const paidInvoices = rawInvoices.filter(invoice => {
    const createdDate = new Date(invoice.createdAt);
    const week = getWeekOfYear(createdDate);
    const invoiceQuarter = getQuarterFromWeek(week);
    return invoice.paymentStatus === true && 
           createdDate.getFullYear() === year && 
           invoiceQuarter === quarter;
  });
  
  const unpaidInvoices = rawInvoices.filter(invoice => {
    const createdDate = new Date(invoice.createdAt);
    const week = getWeekOfYear(createdDate);
    const invoiceQuarter = getQuarterFromWeek(week);
    return invoice.paymentStatus === false && 
           createdDate.getFullYear() === year && 
           invoiceQuarter === quarter;
  });

  // Dữ liệu cho biểu đồ tỷ lệ thanh toán (từ API thực)
  const paymentStatusData = [
    { name: 'Da thanh toan', value: paidInvoices.length, color: '#DC2626' },
    { name: 'Chua thanh toan', value: unpaidInvoices.length, color: '#F59E0B' }
  ];

  // Nếu không có dữ liệu từ API, sử dụng tỷ lệ ước tính từ tổng số bookings
  const finalPaymentStatusData = (paidInvoices.length + unpaidInvoices.length) === 0 
    ? [
        { name: 'Da thanh toan', value: Math.round(totalBookings * 0.75), color: '#DC2626' },
        { name: 'Chua thanh toan', value: Math.round(totalBookings * 0.25), color: '#F59E0B' }
      ]
    : paymentStatusData;

  const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const unpaidRevenue = unpaidInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  // Thống kê payment methods
  const paymentMethodStats = rawInvoices
    .filter(invoice => {
      const createdDate = new Date(invoice.createdAt);
      const week = getWeekOfYear(createdDate);
      const invoiceQuarter = getQuarterFromWeek(week);
      return createdDate.getFullYear() === year && invoiceQuarter === quarter;
    })
    .reduce((acc, invoice) => {
      const method = invoice.paymentMethod || 'UNKNOWN';
      if (!acc[method]) {
        acc[method] = { count: 0, revenue: 0 };
      }
      acc[method].count += 1;
      acc[method].revenue += invoice.totalAmount;
      return acc;
    }, {});

  const paymentMethodChartData = Object.entries(paymentMethodStats).map(([method, stats]) => ({
    name: method,
    value: stats.count,
    revenue: stats.revenue
  }));

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch invoices from API
        fetchGet(
          "/api/admin/invoice/get-all",
          (response) => {
            const invoices = response.data || [];
            setRawInvoices(invoices);
            
            // Process data for selected quarter and year
            const processedData = processInvoiceData(invoices, quarter, year);
            setData(processedData);
            setSelectedWeek(null);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching invoices:", error);
            setError("Không thể tải dữ liệu báo cáo. Vui lòng thử lại.");
            setLoading(false);
            
            // Fallback to mock data if API fails
            setRawInvoices([]);
            const mockData = generateMockData(quarter);
            setData(mockData);
            setSelectedWeek(null);
          },
          (exception) => {
            console.error("Exception in fetchInvoiceData:", exception);
            setError("Lỗi kết nối. Sử dụng dữ liệu mẫu.");
            setLoading(false);
            
            // Fallback to mock data
            setRawInvoices([]);
            const mockData = generateMockData(quarter);
            setData(mockData);
            setSelectedWeek(null);
          }
        );
      } catch (err) {
        console.error("Error in fetchInvoiceData:", err);
        setError("Lỗi kết nối. Sử dụng dữ liệu mẫu.");
        setLoading(false);
        
        // Fallback to mock data
        setRawInvoices([]);
        const mockData = generateMockData(quarter);
        setData(mockData);
        setSelectedWeek(null);
      }
    };

    fetchInvoiceData();
  }, [quarter, year]);

  // Fallback mock data generator
  const generateMockData = (selectedQuarter) => {
    const startWeek = (selectedQuarter - 1) * 13 + 1;
    const endWeek = selectedQuarter * 13;
    const mockData = [];
    
    for (let week = startWeek; week <= endWeek; week++) {
      mockData.push({
        week,
        revenue: Math.floor(Math.random() * 20000000) + 10000000,
        bookings: Math.floor(Math.random() * 30) + 15
      });
    }
    
    return mockData;
  };

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
        
        <div className="export-controls">
          <button 
            className="export-button export-excel" 
            onClick={exportToExcel}
            disabled={loading || data.length === 0}
            title="Xuất file Excel"
          >
            <FaFileExcel />
            Xuất Excel
          </button>
          <button 
            className="export-button export-pdf" 
            onClick={exportToPDF}
            disabled={loading || data.length === 0}
            title="Xuất file PDF"
          >
            <FaFilePdf />
            Xuất PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="report-loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="report-error">{error}</div>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <div className="report-summary">
            <div className="summary-card">
              <h3>Tổng doanh thu</h3>
              <p className="summary-value">{totalRevenue.toLocaleString("vi-VN")} VNĐ</p>
              <small>Quý {quarter} năm {year}</small>
            </div>
            <div className="summary-card">
              <h3>Tổng lượt đặt</h3>
              <p className="summary-value">{totalBookings}</p>
              <small>Tổng số lượt đặt tour</small>
            </div>
            <div className="summary-card">
              <h3>Doanh thu TB/tuần</h3>
              <p className="summary-value">{safeAverageRevenuePerWeek.toLocaleString("vi-VN")} VNĐ</p>
              <small>Trung bình mỗi tuần</small>
            </div>
            <div className="summary-card">
              <h3>Lượt đặt TB/tuần</h3>
              <p className="summary-value">{Math.round(safeAverageBookingsPerWeek)}</p>
              <small>Trung bình mỗi tuần</small>
            </div>
            <div className="summary-card">
              <h3>Doanh thu/lượt đặt</h3>
              <p className="summary-value">{safeAverageRevenuePerBooking.toLocaleString("vi-VN")} VNĐ</p>
              <small>Trung bình mỗi lượt đặt</small>
            </div>
            <div className="summary-card">
              <h3>Tuần đỉnh cao</h3>
              <p className="summary-value">Tuần {maxRevenueWeek?.week || 'N/A'}</p>
              <small>{maxRevenueWeek?.revenue?.toLocaleString("vi-VN") || 0} VNĐ</small>
            </div>
          </div>

          {/* Biểu đồ miền chính */}
          <div className="chart-container">
            <h3>Biểu đồ doanh thu và lượt đặt theo tuần</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activePayload) {
                    setSelectedWeek(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
                <XAxis dataKey="week" label={{ value: "Tuần", position: "insideBottom", offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: "Doanh thu (VNĐ)", angle: -90, position: "insideLeft", offset: -35}} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Số lượt đặt", angle: 90, position: "insideRight" }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "Doanh thu" ? `${value.toLocaleString("vi-VN")} VNĐ` : value,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B91C1C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh thu"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#D97706"
                  strokeWidth={3}
                  dot={{ fill: '#D97706', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#92400E' }}
                  name="Số lượt đặt"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="report-details">
            <div className="report-table-container">
              <h3>
                Chi tiết doanh thu & lượt đặt tháng {selectedMonth}
                {selectedWeek && (
                  <span className="selected-week-info">
                    (Đang chọn: Tuần {selectedWeek.week})
                  </span>
                )}
              </h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Tuần</th>
                    <th>Doanh thu (VNĐ)</th>
                    <th>Lượt đặt</th>
                    <th>TB/Lượt đặt</th>
                    <th>% Tháng</th>
                  </tr>
                </thead>
                <tbody>
                  {weeksInMonth.map((item) => {
                    const monthlyRevenue = weeksInMonth.reduce((sum, week) => sum + week.revenue, 0);
                    const revenuePercentage = monthlyRevenue > 0 && item.revenue > 0 
                      ? (item.revenue / monthlyRevenue * 100) 
                      : 0;
                    const avgPerBooking = item.bookings > 0 ? item.revenue / item.bookings : 0;
                    
                    // Đảm bảo không có NaN
                    const safeRevenuePercentage = isNaN(revenuePercentage) ? 0 : revenuePercentage;
                    const safeAvgPerBooking = isNaN(avgPerBooking) ? 0 : avgPerBooking;
                    
                    return (
                      <tr
                        key={item.week}
                        className={selectedWeek && selectedWeek.week === item.week ? "selected" : ""}
                        onClick={() => setSelectedWeek(item)}
                      >
                        <td>Tuần {item.week}</td>
                        <td>{item.revenue.toLocaleString("vi-VN")}</td>
                        <td>{item.bookings}</td>
                        <td>{safeAvgPerBooking.toLocaleString("vi-VN")}</td>
                        <td>{safeRevenuePercentage.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                  <tr className="summary-row">
                    <td><strong>Tổng tháng {selectedMonth}</strong></td>
                    <td><strong>{weeksInMonth.reduce((sum, item) => sum + item.revenue, 0).toLocaleString("vi-VN")}</strong></td>
                    <td><strong>{weeksInMonth.reduce((sum, item) => sum + item.bookings, 0)}</strong></td>
                    <td><strong>
                      {(() => {
                        const totalBookings = weeksInMonth.reduce((sum, item) => sum + item.bookings, 0);
                        const totalRevenue = weeksInMonth.reduce((sum, item) => sum + item.revenue, 0);
                        const avgRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
                        const safeAvgRevenue = isNaN(avgRevenue) ? 0 : avgRevenue;
                        return safeAvgRevenue.toLocaleString("vi-VN");
                      })()}
                    </strong></td>
                    <td><strong>100%</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="report-charts-row">
              <div className="report-pie-container">
                <h3>Tỷ lệ doanh thu theo tuần - Tháng {selectedMonth}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#B91C1C"
                      label={false}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const total = pieData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [`${value.toLocaleString("vi-VN")} VNĐ (${percentage}%)`, "Doanh thu"];
                      }}
                      contentStyle={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value, entry) => {
                        const total = pieData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                        return `${value} (${percentage}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="payment-status-container">
                <h3>Tỷ lệ thanh toán (Quý {quarter})</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={finalPaymentStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#EF4444"
                      label={false}
                    >
                      {finalPaymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const total = finalPaymentStatusData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [`${value} giao dịch (${percentage}%)`, name];
                      }}
                      contentStyle={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value, entry) => {
                        const total = finalPaymentStatusData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                        return `${value} (${percentage}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="payment-summary">
                  <p><strong>Tỷ lệ thanh toán thành công:</strong> {
                    (() => {
                      const paid = finalPaymentStatusData[0]?.value || 0;
                      const unpaid = finalPaymentStatusData[1]?.value || 0;
                      const total = paid + unpaid;
                      const percentage = total > 0 ? (paid / total * 100) : 0;
                      const safePercentage = isNaN(percentage) ? 0 : percentage;
                      return safePercentage.toFixed(1);
                    })()
                  }%</p>
                  <p><strong>Doanh thu đã thu:</strong> {
                    (() => {
                      if ((paidInvoices.length + unpaidInvoices.length) === 0) {
                        const estimatedPaid = totalRevenue * 0.75;
                        return (isNaN(estimatedPaid) ? 0 : estimatedPaid).toLocaleString("vi-VN");
                      } else {
                        return (isNaN(paidRevenue) ? 0 : paidRevenue).toLocaleString("vi-VN");
                      }
                    })()
                  } VNĐ</p>
                  <p><strong>Doanh thu chưa thu:</strong> {
                    (() => {
                      if ((paidInvoices.length + unpaidInvoices.length) === 0) {
                        const estimatedUnpaid = totalRevenue * 0.25;
                        return (isNaN(estimatedUnpaid) ? 0 : estimatedUnpaid).toLocaleString("vi-VN");
                      } else {
                        return (isNaN(unpaidRevenue) ? 0 : unpaidRevenue).toLocaleString("vi-VN");
                      }
                    })()
                  } VNĐ</p>
                  <p><strong>Tổng số hóa đơn:</strong> {
                    (paidInvoices.length + unpaidInvoices.length) === 0 
                      ? (finalPaymentStatusData[0]?.value || 0) + (finalPaymentStatusData[1]?.value || 0)
                      : paidInvoices.length + unpaidInvoices.length
                  }</p>
                </div>
              </div>

              {paymentMethodChartData.length > 0 && (
                <div className="payment-method-container">
                  <h3>Phương thức thanh toán (Quý {quarter})</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#F59E0B"
                        label={false}
                      >
                        {paymentMethodChartData.map((_, index) => (
                          <Cell key={`method-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const total = paymentMethodChartData.reduce((sum, item) => sum + item.value, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return [`${value} giao dịch (${percentage}%)`, name];
                        }}
                        contentStyle={{
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value, entry) => {
                          const total = paymentMethodChartData.reduce((sum, item) => sum + item.value, 0);
                          const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                          return `${value} (${percentage}%)`;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="payment-method-summary">
                    {paymentMethodChartData.map(method => (
                      <p key={method.name}>
                        <strong>{method.name}:</strong> {method.value} giao dịch - {method.revenue.toLocaleString("vi-VN")} VNĐ
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}