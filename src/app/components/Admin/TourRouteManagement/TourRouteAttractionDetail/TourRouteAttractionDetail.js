import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
} from "@mui/material";

export default function TourRouteAttractionDetail({ activity, day, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(true); // Mặc định là chế độ chỉnh sửa
  const [tempData, setTempData] = useState({
    name: activity?.name || "",
    tag: activity?.tag || "",
    day: day || "",
    description: "",
  });

  const handleCancelEdit = () => {
    setTempData({
      name: activity?.name || "",
      tag: activity?.tag || "",
      day: day || "",
      description: "",
    });
    onClose();
  };

  const handleConfirmEdit = () => {
    // Lưu dữ liệu hoạt động đã chỉnh sửa
    onSave({
      name: tempData.name,
      tag: tempData.tag,
    });
  };

  return (
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
        <Typography variant="h6">Thông tin lịch trình</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            label="Địa điểm"
            fullWidth
            value={tempData.name}
            onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Loại địa điểm"
            fullWidth
            value={tempData.tag}
            onChange={(e) => setTempData({ ...tempData, tag: e.target.value })}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Ngày thứ"
            fullWidth
            value={tempData.day}
            onChange={(e) => setTempData({ ...tempData, day: e.target.value })}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Mô tả hoạt động"
            fullWidth
            multiline
            minRows={4}
            value={tempData.description}
            onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
            disabled={!isEditing}
            sx={{
                mt: 2,
                // Chỉnh width
                minWidth: "800px", // Hoặc đặt cụ thể như "500px" nếu muốn giới hạn
                // Chỉnh height
                "& .MuiInputBase-root": {
                    minHeight: "150px", 
                    maxHeight: "200px", 
                    overflow: "auto", 
                },
                }}
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
  );
}