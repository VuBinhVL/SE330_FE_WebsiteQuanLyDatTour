import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { fetchGet } from "../../../../lib/httpHandler";
import AddTourBooking from "../AddTourBooking/AddTourBooking";

export default function DetailTour() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({});
  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      fullName: "Nguyễn Văn A",
      gender: "Nam",
      phone: "0901234567",
      email: "vana@example.com",
      booker: "Nguyễn Văn A",
    },
    {
      id: "BK002",
      fullName: "Trần Thị B",
      gender: "Nữ",
      phone: "0912345678",
      email: "thib@example.com",
      booker: "Trần Thị B",
    },
  ]);
  const [openAddBookingDialog, setOpenAddBookingDialog] = useState(false);

  useEffect(() => {
    // Lấy thông tin tour
    fetchGet(
      `/api/admin/tour/get/${id}`,
      async (res) => {
        console.log("Dữ liệu tour:", res.data);
        try {
          // Lấy thông tin tuyến du lịch
          const tourRouteId = res.data.tourRouteId;
          fetchGet(
            `/api/admin/tour-route/get/${tourRouteId}`,
            (routeRes) => {
              const tourData = {
                id: res.data.id,
                tourId: res.data.id,
                // tourId: `TOUR${String(res.data.id).padStart(3, "0")}`,
                name: routeRes.data?.routeName || `Tuyến du lịch ${tourRouteId}`,
                startDate: new Date(res.data.depatureDate).toLocaleDateString("vi-VN"),
                endDate: new Date(res.data.endDate || res.data.depatureDate).toLocaleDateString("vi-VN"),
                departureTime: res.data.departureTime || "07:00", // Giả định nếu API không cung cấp
                departure: res.data.pickUpLocation,
                price: res.data.price.toLocaleString("vi-VN") + " VND",
                soldSeats: res.data.bookedSeats || 0,
                maxSeats: res.data.totalSeats || 30,
                status: res.data.status === 0 ? "Hoạt động" : "Ngừng hoạt động",
              };
              setTour(tourData);
              setTempData(tourData);
            },
            (err) => {
              console.error("Lỗi lấy tour route:", err);
              // Fallback nếu không lấy được tour route
              const tourData = {
                id: res.data.id,
                tourId: `TOUR${String(res.data.id).padStart(3, "0")}`,
                name: `Chuyến du lịch ${res.data.id}`,
                startDate: new Date(res.data.depatureDate).toLocaleDateString("vi-VN"),
                endDate: new Date(res.data.endDate || res.data.depatureDate).toLocaleDateString("vi-VN"),
                departureTime: res.data.departureTime || "07:00",
                departure: res.data.pickUpLocation,
                price: res.data.price.toLocaleString("vi-VN") + " VND",
                soldSeats: res.data.bookedSeats || 0,
                maxSeats: res.data.totalSeats || 30,
                status: res.data.status === 0 ? "Hoạt động" : "Ngừng hoạt động",
              };
              setTour(tourData);
              setTempData(tourData);
            }
          );
        } catch (error) {
          console.error("Lỗi xử lý dữ liệu tour:", error);
        }
      },
      (err) => {
        console.error("Lỗi lấy tour:", err);
        setTour(null);
      }
    );
  }, [id]);

  const handleToggleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTempData(tour);
    setIsEditing(false);
  };

  const handleConfirmEdit = () => {
    setTour(tempData);
    setIsEditing(false);
    // TODO: Gọi API để cập nhật tour nếu cần
    // fetchPut(`/api/admin/tour/update/${id}`, tempData, ...)
  };

  const handleAddBooking = () => {
    setOpenAddBookingDialog(true);
  };

  const handleCloseAddBookingDialog = () => {
    setOpenAddBookingDialog(false);
  };

  const handleSaveBooking = (newBooking) => {
    setBookings((prev) => [...prev, newBooking]);
    handleCloseAddBookingDialog();
    // TODO: Gọi API để lưu booking nếu cần
    // fetchPost(`/api/admin/tour/bookings`, newBooking, ...)
  };

  if (!tour) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      {/* Thông tin chuyến đi */}
      <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 3, position: "relative" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{tour.name}</Typography>
          <Button onClick={handleToggleEdit}>
            <EditIcon fontSize="small" />
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Mã chuyến du lịch"
              fullWidth
              value={tempData.tourId || ""}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Ngày khởi hành"
              fullWidth
              value={tempData.startDate || ""}
              onChange={(e) => setTempData({ ...tempData, startDate: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Ngày trở về"
              fullWidth
              value={tempData.endDate || ""}
              onChange={(e) => setTempData({ ...tempData, endDate: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Giờ xuất phát"
              fullWidth
              value={tempData.departureTime || ""}
              onChange={(e) => setTempData({ ...tempData, departureTime: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Điểm xuất phát"
              fullWidth
              value={tempData.departure || ""}
              onChange={(e) => setTempData({ ...tempData, departure: e.target.value })}
              disabled={!isEditing}
              sx={{minWidth: 300}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Giá (VND)"
              fullWidth
              value={tempData.price || ""}
              onChange={(e) => setTempData({ ...tempData, price: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số chỗ đã bán"
              fullWidth
              value={tempData.soldSeats || ""}
              disabled
              sx={{maxWidth: 150}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số chỗ tối đa"
              fullWidth
              value={tempData.maxSeats || ""}
              onChange={(e) => setTempData({ ...tempData, maxSeats: e.target.value })}
              disabled={!isEditing}
              sx={{maxWidth: 150}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Trạng thái"
              fullWidth
              value={tempData.status || ""}
              onChange={(e) => setTempData({ ...tempData, status: e.target.value })}
              disabled={!isEditing}
              sx={{maxWidth: 150}}
            />
          </Grid>
        </Grid>

        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button variant="outlined" onClick={handleCancelEdit}>
              Huỷ
            </Button>
            <Button variant="contained" onClick={handleConfirmEdit}>
              Xác nhận
            </Button>
          </Box>
        )}
      </Box>

      {/* Danh sách hành khách */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Danh sách hành khách</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddBooking}
        >
          Thêm phiếu đặt chỗ
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu đặt</TableCell>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Giới tính</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Người đặt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.fullName}</TableCell>
                <TableCell>{booking.gender}</TableCell>
                <TableCell>{booking.phone}</TableCell>
                <TableCell>{booking.email}</TableCell>
                <TableCell>{booking.booker}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog để thêm phiếu đặt chỗ */}
      <Dialog
        open={openAddBookingDialog}
        onClose={handleCloseAddBookingDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Thêm phiếu đặt chỗ mới</DialogTitle>
        <DialogContent>
          <AddTourBooking onClose={handleCloseAddBookingDialog} onSave={handleSaveBooking} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}