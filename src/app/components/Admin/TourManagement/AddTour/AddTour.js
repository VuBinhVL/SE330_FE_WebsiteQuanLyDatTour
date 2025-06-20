import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPost, fetchGet } from "../../../../lib/httpHandler";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

export default function AddTour({ onClose, setTours }) {
  const [isEditing, setIsEditing] = useState(true);
  const [tempData, setTempData] = useState({
    routeName: "",
    startDate: null,
    endDate: null,
    totalSeats: "",
    pickUpTime: "",
    pickUpLocation: "",
    price: "",
  });
  const [tourRoutes, setTourRoutes] = useState([]);

  useEffect(() => {
    fetchGet(
      "/api/admin/tour-route/get-all",
      (res) => {
        setTourRoutes(res.data || []);
      },
      (err) => {
        console.error("Lỗi khi lấy danh sách tuyến du lịch:", err);
        toast.error("Không thể tải danh sách tuyến du lịch!", { autoClose: 5000 });
      },
      () => {
        toast.error("Đã xảy ra lỗi mạng khi tải danh sách tuyến du lịch!", { autoClose: 5000 });
      }
    );
  }, []);

  const handleCancelEdit = () => {
    setTempData({
      routeName: "",
      startDate: null,
      endDate: null,
      totalSeats: "",
      pickUpTime: "",
      pickUpLocation: "",
      price: "",
    });
    onClose();
  };

  const handleConfirmEdit = () => {
    const errors = [];

    if (!tempData.routeName) {
      errors.push("Tên tuyến du lịch không được để trống");
    }

    if (!tempData.startDate) {
      errors.push("Ngày khởi hành không được để trống");
    }

    if (!tempData.endDate) {
      errors.push("Ngày trở về không được để trống");
    } else if (tempData.startDate && tempData.endDate && tempData.endDate.isBefore(tempData.startDate)) {
      errors.push("Ngày trở về phải sau ngày khởi hành");
    }

    if (!tempData.pickUpTime) {
      errors.push("Giờ xuất phát không được để trống");
    } else if (!/^\d{2}:\d{2}$/.test(tempData.pickUpTime)) {
      errors.push("Giờ xuất phát phải có định dạng HH:MM (ví dụ: 07:15)");
    } else {
      const [hours, minutes] = tempData.pickUpTime.split(":").map(Number);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        errors.push("Giờ xuất phát phải nằm trong khoảng từ 00:00 đến 23:59");
      }
    }

    if (!tempData.pickUpLocation) {
      errors.push("Điểm xuất phát không được để trống");
    }

    if (!tempData.price || isNaN(tempData.price) || tempData.price < 0) {
      errors.push("Giá phải là một số hợp lệ và không âm");
    }

    if (!tempData.totalSeats || !Number.isInteger(Number(tempData.totalSeats)) || Number(tempData.totalSeats) <= 0) {
      errors.push("Số chỗ tối đa phải là số nguyên dương");
    }

    if (errors.length > 0) {
      toast.error("Vui lòng kiểm tra lại:\n" + errors.join("\n"), {
        autoClose: 5000,
      });
      return;
    }

    const selectedTourRoute = tourRoutes.find((route) => route.routeName === tempData.routeName);
    if (!selectedTourRoute) {
      toast.error("Tên tuyến du lịch không hợp lệ!", { autoClose: 5000 });
      return;
    }

    const startDateWithTime = tempData.startDate
      ? tempData.startDate.startOf("day").toISOString()
      : null;
    const endDateWithTime = tempData.endDate
      ? tempData.endDate.endOf("day").toISOString()
      : null;
    const [hours, minutes] = tempData.pickUpTime.split(":");
    const pickUpDateTime = tempData.startDate && tempData.pickUpTime
      ? tempData.startDate
          .set("hour", parseInt(hours, 10))
          .set("minute", parseInt(minutes, 10))
          .set("second", 0)
          .set("millisecond", 0)
          .toISOString()
      : null;

    const tourDTO = {
      depatureDate: startDateWithTime,
      returnDate: endDateWithTime,
      status: 0,
      price: parseFloat(tempData.price),
      totalSeats: parseInt(tempData.totalSeats, 10),
      bookedSeats: 0,
      pickUpTime: pickUpDateTime,
      pickUpLocation: tempData.pickUpLocation,
      tourRouteId: selectedTourRoute.id,
    };

    fetchPost(
      "/api/admin/tour/create",
      tourDTO,
      (res) => {
        const newTour = {
          id: res.data.id,
          name: tempData.routeName,
          status: res.data.status === 0 ? "Hoạt động" : "Không hoạt động",
          departure: res.data.pickUpLocation,
          startDate: res.data.depatureDate ? dayjs(res.data.depatureDate).format("DD/MM/YYYY") : "",
          price: res.data.price,
          quantity: res.data.totalSeats,
        };

        setTours((prev) => [...prev, newTour]);
        toast.success("Thêm chuyến du lịch thành công!", { autoClose: 3000 });
        setTimeout(onClose, 3000); // Delay onClose to ensure toast is visible
      },
      (err) => {
        console.error("Lỗi khi thêm chuyến du lịch:", err);
        toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi thêm chuyến du lịch", {
          autoClose: 5000,
        });
      },
      () => {
        toast.error("Đã xảy ra lỗi mạng khi thêm chuyến du lịch!", { autoClose: 5000 });
      }
    );
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = value ? parseFloat(value) : "";
    setTempData({ ...tempData, price: numericValue });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          position: "relative",
        }}
      >
        <ToastContainer />
        <Box mb={2}>
          <Typography variant="h6">Thêm chuyến du lịch</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel>Tên tuyến du lịch</InputLabel>
              <Select
                value={tempData.routeName}
                onChange={(e) => setTempData({ ...tempData, routeName: e.target.value })}
                disabled={!isEditing}
              >
                {tourRoutes.map((route) => (
                  <MenuItem key={route.id} value={route.routeName}>
                    {route.routeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              label="Số chỗ tối đa"
              type="number"
              fullWidth
              value={tempData.totalSeats}
              onChange={(e) => setTempData({ ...tempData, totalSeats: e.target.value })}
              disabled={!isEditing}
              sx={{ maxWidth: 150 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Giờ xuất phát (HH:MM)"
              fullWidth
              value={tempData.pickUpTime}
              onChange={(e) => setTempData({ ...tempData, pickUpTime: e.target.value })}
              disabled={!isEditing}
              placeholder="07:15"
              sx={{ maxWidth: 200 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Điểm xuất phát"
              fullWidth
              value={tempData.pickUpLocation}
              onChange={(e) => setTempData({ ...tempData, pickUpLocation: e.target.value })}
              disabled={!isEditing}
              placeholder="Nhập điểm xuất phát"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Giá (VND)"
              type="text"
              fullWidth
              value={tempData.price}
              onChange={handlePriceChange}
              disabled={!isEditing}
              sx={{ maxWidth: 200 }}
            />
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
    </LocalizationProvider>
  );
}