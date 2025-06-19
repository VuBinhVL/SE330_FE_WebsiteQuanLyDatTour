import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import AddTourBooking from "../AddTourBooking/AddTourBooking";

export default function DetailTour() {
  const { id } = useParams();
  const location = useLocation();
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
    const tourData = location.state?.tour || {
      name: "Thái Lan: Bangkok - Pattaya",
      tourId: `TOUR${id.padStart(3, "0")}`,
      startDate: "01/01/2026",
      endDate: "05/01/2026",
      departureTime: "07:00",
      departure: "Đà Nẵng",
      price: "5,000,000 VND",
      soldSeats: 10,
      maxSeats: 30,
      status: "Hoạt động",
    };
    setTour(tourData);
    setTempData(tourData);
  }, [id, location.state]);

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
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số chỗ tối đa"
              fullWidth
              value={tempData.maxSeats || ""}
              onChange={(e) => setTempData({ ...tempData, maxSeats: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Trạng thái"
              fullWidth
              value={tempData.status || ""}
              onChange={(e) => setTempData({ ...tempData, status: e.target.value })}
              disabled={!isEditing}
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