import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

export default function AddTourRoute({ onClose, setTourRoutes }) {
  const [isEditing, setIsEditing] = useState(true); // Mặc định là chế độ chỉnh sửa
  const [tempData, setTempData] = useState({
    name: "",
    departure: "",
    destination: "",
    startDate: null, // Sử dụng null cho DateTimePicker
    endDate: null, // Sử dụng null cho DateTimePicker
    duration: "",
  });

  const handleCancelEdit = () => {
    setTempData({
      name: "",
      departure: "",
      destination: "",
      startDate: null,
      endDate: null,
      duration: "",
    });
    onClose();
  };

  const handleConfirmEdit = () => {
    // Tạo ID mới (tạm thời dùng random, thực tế nên dùng UUID hoặc từ backend)
    const newTourRoute = {
      id: Math.floor(Math.random() * 1000) + 1,
      image: "https://via.placeholder.com/36", // Ảnh mặc định
      name: tempData.name,
      status: "Hoạt động",
      departure: tempData.departure,
      duration: tempData.duration,
      price: "0 VND", // Giá mặc định, có thể thêm field để nhập
    };

    // Cập nhật danh sách tour routes
    setTourRoutes((prev) => [...prev, newTourRoute]);

    // Đóng dialog
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          mb: 3,
          position: "relative",
        }}
      >
        <Box mb={2}>
          <Typography variant="h6">Tên tuyến du lịch</Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          value={tempData.name}
          onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
          disabled={!isEditing}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Khởi hành"
              fullWidth
              value={tempData.departure}
              onChange={(e) => setTempData({ ...tempData, departure: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Điểm đến"
              fullWidth
              value={tempData.destination}
              onChange={(e) => setTempData({ ...tempData, destination: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={4}>
            <DateTimePicker
              label="Ngày bắt đầu"
              value={tempData.startDate}
              onChange={(newValue) => setTempData({ ...tempData, startDate: newValue })}
              disabled={!isEditing}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={4}>
            <DateTimePicker
              label="Ngày kết thúc"
              value={tempData.endDate}
              onChange={(newValue) => setTempData({ ...tempData, endDate: newValue })}
              disabled={!isEditing}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Thời gian"
              fullWidth
              value={tempData.duration}
              onChange={(e) => setTempData({ ...tempData, duration: e.target.value })}
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