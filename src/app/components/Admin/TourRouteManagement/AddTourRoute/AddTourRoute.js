import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Input,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { fetchPost, fetchUpload } from "../../../../lib/httpHandler";

export default function AddTourRoute({ onClose, setTourRoutes }) {
  const [isEditing, setIsEditing] = useState(true);
  const [tempData, setTempData] = useState({
    name: "",
    departure: "",
    destination: "",
    startDate: null,
    endDate: null,
    image: null,
    imagePreview: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempData({
        ...tempData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleCancelEdit = () => {
    setTempData({
      name: "",
      departure: "",
      destination: "",
      startDate: null,
      endDate: null,
      image: null,
      imagePreview: "",
    });
    onClose();
  };

  const handleConfirmEdit = () => {
    const errors = [];

    if (!tempData.name) {
      errors.push("Tên tuyến du lịch không được để trống");
    }

    if (!tempData.departure) {
      errors.push("Điểm khởi hành không được để trống");
    }

    if (!tempData.destination) {
      errors.push("Điểm đến không được để trống");
    }

    if (!tempData.startDate) {
      errors.push("Ngày bắt đầu không được để trống");
    }

    if (!tempData.endDate) {
      errors.push("Ngày kết thúc không được để trống");
    } else if (tempData.startDate && tempData.endDate && tempData.endDate.isBefore(tempData.startDate)) {
      errors.push("Ngày kết thúc phải sau ngày bắt đầu");
    }

    if (!tempData.image) {
      errors.push("Ảnh không được để trống");
    }

    if (errors.length > 0) {
      toast.error("Vui lòng kiểm tra lại:\n" + errors.join("\n"), {
        autoClose: 5000,
      });
      return;
    }

    // Bước 1: Upload ảnh
    const formData = new FormData();
    formData.append("image", tempData.image);

    fetchUpload(
      "/api/asset/upload-image",
      formData,
      (res) => {
        const imageUrl = res.data; // Giả định res.data là imageUrl

        // Bước 2: Tạo TourRoute với URL ảnh
        const tourRouteDTO = {
          routeName: tempData.name,
          startLocation: tempData.departure,
          endLocation: tempData.destination,
          startDate: tempData.startDate ? tempData.startDate.startOf("day").toISOString() : null,
          endDate: tempData.endDate ? tempData.endDate.endOf("day").toISOString() : null,
          image: imageUrl,
        };

        fetchPost(
          "/api/admin/tour-route/create",
          tourRouteDTO,
          (res) => {
            const newTourRoute = {
              id: res.data.id,
              image: res.data.image || "https://via.placeholder.com/36",
              name: tempData.name,
              status: "Hoạt động",
              departure: tempData.departure,
              destination: tempData.destination,
              startDate: tempData.startDate ? dayjs(tempData.startDate).format("DD/MM/YYYY") : "",
              endDate: tempData.endDate ? dayjs(tempData.endDate).format("DD/MM/YYYY") : "",
            };

            setTourRoutes((prev) => [...prev, newTourRoute]);
            toast.success("Thêm tuyến du lịch thành công!", { autoClose: 3000 });
            setTimeout(onClose, 3000);
          },
          (err) => {
            console.error("Lỗi khi thêm tuyến du lịch:", err);
            toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi thêm tuyến du lịch", {
              autoClose: 5000,
            });
          },
          () => {
            toast.error("Đã xảy ra lỗi mạng khi thêm tuyến du lịch!", { autoClose: 5000 });
          }
        );
      },
      (err) => {
        console.error("Lỗi khi upload ảnh:", err);
        toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi upload ảnh", {
          autoClose: 5000,
        });
      },
      () => {
        toast.error("Đã xảy ra lỗi mạng khi upload ảnh!", { autoClose: 5000 });
      }
    );
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
          <Typography variant="h6">Thêm tuyến du lịch</Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Tên tuyến du lịch"
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
          <Grid item xs={6}>
            <DateTimePicker
              label="Ngày bắt đầu"
              value={tempData.startDate}
              onChange={(newValue) => setTempData({ ...tempData, startDate: newValue })}
              disabled={!isEditing}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <DateTimePicker
              label="Ngày kết thúc"
              value={tempData.endDate}
              onChange={(newValue) => setTempData({ ...tempData, endDate: newValue })}
              disabled={!isEditing}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="body1" mb={1}>Tải ảnh lên</Typography>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!isEditing}
                sx={{ mb: 2 }}
              />
              {tempData.imagePreview && (
                <Box mt={1}>
                  <img
                    src={tempData.imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                  />
                </Box>
              )}
            </Box>
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