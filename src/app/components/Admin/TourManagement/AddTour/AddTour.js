import React, { useState } from "react";
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
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

export default function AddTour({ onClose, setTours }) {
  const [isEditing, setIsEditing] = useState(true);
  const [tempData, setTempData] = useState({
    name: "",
    startDate: null,
    endDate: null,
    quantity: "",
    departureTime: null,
    departure: "",
    price: "",
  });

  // Danh sách mẫu cho combobox Tên tuyến du lịch
  const tourOptions = [
    "Thái Lan: Bangkok - Pattaya",
    "Việt Nam: Hà Nội - Sapa",
    "Nhật Bản: Tokyo - Osaka",
    "Hàn Quốc: Seoul - Jeju",
  ];

  const handleCancelEdit = () => {
    setTempData({
      name: "",
      startDate: null,
      endDate: null,
      quantity: "",
      departureTime: null,
      departure: "",
      price: "",
    });
    onClose();
  };

  const handleConfirmEdit = () => {
    const newTour = {
      id: Math.floor(Math.random() * 1000) + 1,
      name: tempData.name,
      status: "Hoạt động",
      departure: tempData.departure,
      startDate: tempData.startDate ? dayjs(tempData.startDate).format("DD/MM/YYYY") : "",
      price: tempData.price,
      quantity: tempData.quantity,
    };

    setTours((prev) => [...prev, newTour]);
    onClose();
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
        <Box mb={2}>
          {/* <Typography variant="h6">Thêm chuyến đi</Typography> */}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ minWidth: 220}}>
              <InputLabel>Tên tuyến du lịch</InputLabel>
              <Select
                value={tempData.name}
                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                disabled={!isEditing}
              >
                {tourOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <DateTimePicker sx={{ maxWidth: 170}}
              label="Ngày khởi hành"
              value={tempData.startDate}
              onChange={(newValue) => setTempData({ ...tempData, startDate: newValue })}
              disabled={!isEditing}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <DateTimePicker sx={{ maxWidth: 170}}
              label="Ngày trở về"
              value={tempData.endDate}
              onChange={(newValue) => setTempData({ ...tempData, endDate: newValue })}
              disabled={!isEditing}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
                sx={{ maxWidth: 150}}
              label="Số chỗ tối đa"
              type="number"
              fullWidth
              value={tempData.quantity}
              onChange={(e) => setTempData({ ...tempData, quantity: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth sx={{ minWidth: 220}}>
                <InputLabel>Giờ xuất phát</InputLabel>
                <Select
                value={tempData.departureTime || ""}
                onChange={(e) => setTempData({ ...tempData, departureTime: e.target.value })}
                disabled={!isEditing}
                >
                {["07:00", "08:00", "09:00", "10:00", "11:00"].map((time) => (
                    <MenuItem key={time} value={time}>
                    {time}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={6}>
            <FormControl fullWidth sx={{ minWidth: 220}}>
                <InputLabel>Điểm xuất phát</InputLabel>
                <Select
                value={tempData.departure}
                onChange={(e) => setTempData({ ...tempData, departure: e.target.value })}
                disabled={!isEditing}
                >
                {["Đà Nẵng", "Hà Nội", "TP. Hồ Chí Minh", "Huế"].map((location) => (
                    <MenuItem key={location} value={location}>
                    {location}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>
          <Grid item xs={6}>
            <TextField
              label="Giá (VND)"
              type="text"
              fullWidth
              value={tempData.price}
              onChange={(e) => setTempData({ ...tempData, price: e.target.value })}
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
    </LocalizationProvider>
  );
}