import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPut, fetchGet } from "../../../../lib/httpHandler";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddTourBooking from "../AddTourBooking/AddTourBooking";
import viLocale from "date-fns/locale/vi";

export default function DetailTour() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [openAddBookingDialog, setOpenAddBookingDialog] = useState(false);

  // Hàm lấy thông tin tour
  const fetchTourData = () => {
    fetchGet(
      `/api/admin/tour/get/${id}`,
      async (res) => {
        console.log("Dữ liệu tour:", res.data);
        try {
          const tourRouteId = res.data.tourRouteId;
          fetchGet(
            `/api/admin/tour-route/get/${tourRouteId}`,
            (routeRes) => {
              const pickUpTime = res.data.pickUpTime
                ? new Date(res.data.pickUpTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "07:00";

              const tourData = {
                id: res.data.id,
                tourId: `TOUR${String(res.data.id).padStart(3, "0")}`,
                name: routeRes.data?.routeName || `Tuyến du lịch ${tourRouteId}`,
                startDate: res.data.depatureDate ? new Date(res.data.depatureDate) : null,
                endDate: res.data.returnDate ? new Date(res.data.returnDate) : null,
                pickUpTime: pickUpTime,
                departure: res.data.pickUpLocation,
                price: res.data.price,
                bookedSeats: res.data.bookedSeats || 0,
                maxSeats: res.data.totalSeats || 30,
                status:
                  res.data.status === 0
                    ? "Hoạt động"
                    : res.data.status === 1
                    ? "Đã hủy"
                    : res.data.status === 2
                    ? "Hết vé"
                    : res.data.status === 3
                    ? "Hoàn thành"
                    : "Không xác định",
              };
              setTour(tourData);
              setTempData(tourData);
            },
            (err) => {
              console.error("Lỗi lấy tour route:", err);
              const pickUpTime = res.data.pickUpTime
                ? new Date(res.data.pickUpTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "07:00";

              const tourData = {
                id: res.data.id,
                tourId: `TOUR${String(res.data.id).padStart(3, "0")}`,
                name: `Chuyến du lịch ${res.data.id}`,
                startDate: res.data.depatureDate ? new Date(res.data.depatureDate) : null,
                endDate: res.data.returnDate ? new Date(res.data.returnDate) : null,
                pickUpTime: pickUpTime,
                departure: res.data.pickUpLocation,
                price: res.data.price,
                bookedSeats: res.data.bookedSeats || 0,
                maxSeats: res.data.totalSeats || 30,
                status:
                  res.data.status === 0
                    ? "Hoạt động"
                    : res.data.status === 1
                    ? "Đã hủy"
                    : res.data.status === 2
                    ? "Hết vé"
                    : res.data.status === 3
                    ? "Hoàn thành"
                    : "Không xác định",
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
        toast.error("Lỗi khi tải thông tin tour!", { autoClose: 5000 });
      }
    );
  };

  // Hàm lấy danh sách hành khách
  const fetchBookingsData = () => {
    fetchGet(
      `/api/admin/tour/get-list-tour-booking/${id}`,
      (res) => {
        console.log("Dữ liệu bookings:", res.data);
        setBookings(
          res.data.map((item) => ({
            id: item.tourBookingId,
            fullName: item.userMemberFullname,
            gender: item.userMemberSex ? "Nam" : "Nữ",
            phone: item.userMemberPhoneNumber,
            email: item.userMemberEmail,
            booker: item.userFullname,
          }))
        );
      },
      (err) => {
        console.error("Lỗi lấy danh sách hành khách:", err);
        toast.error("Lỗi khi tải danh sách hành khách!", { autoClose: 5000 });
        setBookings([]);
      }
    );
  };

  useEffect(() => {
    fetchTourData();
    fetchBookingsData();
  }, [id]);

  const handleToggleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTempData(tour);
    setIsEditing(false);
  };

  const handleConfirmEdit = () => {
    const errors = [];

    if (!tempData?.name) {
      errors.push("Tên tuyến du lịch không được để trống");
    }

    if (!tempData?.startDate) {
      errors.push("Ngày khởi hành không được để trống");
    }

    if (!tempData?.endDate) {
      errors.push("Ngày trở về không được để trống");
    } else if (tempData.startDate && tempData.endDate && tempData.endDate < tempData.startDate) {
      errors.push("Ngày trở về phải sau ngày khởi hành");
    }

    if (!tempData?.pickUpTime) {
      errors.push("Giờ xuất phát không được để trống");
    } else if (!/^\d{2}:\d{2}$/.test(tempData.pickUpTime)) {
      errors.push("Giờ xuất phát phải có định dạng HH:MM");
    }

    if (!tempData?.departure) {
      errors.push("Điểm xuất phát không được để trống");
    }

    if (tempData?.price == null || isNaN(tempData.price) || tempData.price < 0) {
      errors.push("Giá phải là một số hợp lệ và không âm");
    }

    if (!tempData?.maxSeats) {
      errors.push("Số chỗ tối đa không được để trống");
    } else if (!Number.isInteger(Number(tempData.maxSeats)) || Number(tempData.maxSeats) <= 0) {
      errors.push("Số chỗ tối đa phải là số nguyên dương");
    }

    if (!tempData?.status) {
      errors.push("Trạng thái không được để trống");
    } else if (
      !["Hoạt động", "Đã hủy", "Hết vé", "Hoàn thành"].includes(tempData.status)
    ) {
      errors.push("Trạng thái không hợp lệ");
    }

    if (errors.length > 0) {
      toast.error("Vui lòng kiểm tra lại:\n" + errors.join("\n"), {
        autoClose: 5000,
      });
      return;
    }

    const startDateWithTime = tempData.startDate
      ? new Date(tempData.startDate.setHours(0, 0, 0, 0)).toISOString()
      : null;
    const endDateWithTime = tempData.endDate
      ? new Date(tempData.endDate.setHours(23, 59, 59, 999)).toISOString()
      : null;
    const pickUpDateTime = tempData.startDate && tempData.pickUpTime
      ? `${new Date(tempData.startDate).toISOString().split("T")[0]}T${tempData.pickUpTime}:00.000`
      : null;

    const tourRouteDTO = {
      routeName: tempData.name,
      depatureDate: startDateWithTime,
      returnDate: endDateWithTime,
      pickUpTime: pickUpDateTime,
      pickUpLocation: tempData.departure,
      price: tempData.price,
      totalSeats: parseInt(tempData.maxSeats, 10),
      bookedSeats: parseInt(tempData.bookedSeats, 10),
      status:
        tempData.status === "Hoạt động"
          ? 0
          : tempData.status === "Đã hủy"
          ? 1
          : tempData.status === "Hết vé"
          ? 2
          : 3,
    };

    console.log("Dữ liệu gửi đi:", tourRouteDTO);

    fetchPut(
      `/api/admin/tour/update/${id}`,
      tourRouteDTO,
      (res) => {
        const pickUpTime = res.data.pickUpTime
          ? new Date(res.data.pickUpTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : tempData.pickUpTime;

        const updatedTour = {
          ...tempData,
          id: res.data?.id || tempData.id,
          tourId: res.data?.id
            ? `TOUR${String(res.data.id).padStart(3, "0")}`
            : tempData.tourId,
          name: res.data?.routeName || tempData.name,
          startDate: res.data?.depatureDate
            ? new Date(res.data.depatureDate)
            : tempData.startDate,
          endDate: res.data?.returnDate ? new Date(res.data.returnDate) : tempData.endDate,
          pickUpTime: pickUpTime,
          departure: res.data?.pickUpLocation || tempData.departure,
          price: res.data?.price || tempData.price,
          bookedSeats: res.data?.bookedSeats || tempData.bookedSeats,
          maxSeats: res.data?.totalSeats || tempData.maxSeats,
          status:
            res.data?.status === 0
              ? "Hoạt động"
              : res.data?.status === 1
              ? "Đã hủy"
              : res.data?.status === 2
              ? "Hết vé"
              : "Hoàn thành",
        };

        setTour(updatedTour);
        setTempData(updatedTour);
        setIsEditing(false);

        toast.success(res.message || "Cập nhật tuyến du lịch thành công!", {
          autoClose: 3000,
        });
      },
      (err) => {
        console.error("Lỗi chi tiết:", err.response?.data);
        toast.error(
          err.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật tuyến du lịch",
          {
            autoClose: 5000,
          }
        );
      }
    );
  };

  const handleAddBooking = () => {
    setOpenAddBookingDialog(true);
  };

  const handleCloseAddBookingDialog = () => {
    setOpenAddBookingDialog(false);
  };

  const handleSaveBooking = (newBooking) => {
    // Cập nhật danh sách hành khách
    setBookings((prev) => [...prev, newBooking]);

    // Cập nhật số chỗ đã đặt
    setTour((prev) => ({
      ...prev,
      bookedSeats: prev.bookedSeats + newBooking.seatsBooked,
    }));
    setTempData((prev) => ({
      ...prev,
      bookedSeats: prev.bookedSeats + newBooking.seatsBooked,
    }));

    // Gọi lại API để lấy dữ liệu tour và bookings mới nhất
    fetchTourData();
    fetchBookingsData();

    handleCloseAddBookingDialog();
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = value ? parseFloat(value) : 0;
    setTempData({ ...tempData, price: isNaN(numericValue) ? 0 : numericValue });
  };

  if (!tour) return <div>Loading...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
      <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
        <ToastContainer />
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
              <DatePicker
                label="Ngày khởi hành"
                value={tempData.startDate}
                onChange={(newValue) => setTempData({ ...tempData, startDate: newValue })}
                disabled={!isEditing}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Ngày trở về"
                value={tempData.endDate}
                onChange={(newValue) => setTempData({ ...tempData, endDate: newValue })}
                disabled={!isEditing}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Giờ xuất phát"
                fullWidth
                value={tempData.pickUpTime || ""}
                onChange={(e) => setTempData({ ...tempData, pickUpTime: e.target.value })}
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
                sx={{ minWidth: 300 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Giá (VND)"
                fullWidth
                value={tempData.price != null ? tempData.price.toLocaleString("vi-VN") : ""}
                onChange={handlePriceChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Số chỗ đã đặt"
                fullWidth
                value={tempData.bookedSeats || 0}
                disabled
                sx={{ maxWidth: 150 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Số chỗ tối đa"
                fullWidth
                value={tempData.maxSeats || ""}
                onChange={(e) => setTempData({ ...tempData, maxSeats: e.target.value })}
                disabled={!isEditing}
                sx={{ maxWidth: 150 }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth sx={{ maxWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={tempData.status || ""}
                  onChange={(e) => setTempData({ ...tempData, status: e.target.value })}
                  disabled={!isEditing}
                >
                  <MenuItem value="Hoạt động">Hoạt động</MenuItem>
                  <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                  <MenuItem value="Hết vé">Hết vé</MenuItem>
                  <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {isEditing && (
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button variant="outlined" onClick={handleCancelEdit}>
                Hủy
              </Button>
              <Button variant="contained" onClick={handleConfirmEdit}>
                Xác nhận
              </Button>
            </Box>
          )}
        </Box>

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
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{`PH${String(booking.id).padStart(3, "0")}`}</TableCell>
                    <TableCell>{booking.fullName}</TableCell>
                    <TableCell>{booking.gender}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.booker}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu hành khách
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openAddBookingDialog}
          onClose={handleCloseAddBookingDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Thêm phiếu đặt chỗ mới</DialogTitle>
          <DialogContent>
            <AddTourBooking
              onClose={handleCloseAddBookingDialog}
              onSave={handleSaveBooking}
              tourId={id}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}