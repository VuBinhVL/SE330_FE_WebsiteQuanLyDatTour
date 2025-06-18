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

export default function AddTourRouteAttraction({ onClose, onAdd, days }) {
  const [isEditing, setIsEditing] = useState(true); // Mặc định là chế độ chỉnh sửa
  const [tempData, setTempData] = useState({
    name: "",
    tag: "",
    day: days[0] || "", // Mặc định chọn ngày đầu tiên nếu có
    description: "",
  });

  const handleCancelEdit = () => {
    setTempData({
      name: "",
      tag: "",
      day: days[0] || "",
      description: "",
    });
    onClose();
  };

  const handleConfirmEdit = () => {
    // Lưu dữ liệu hoạt động mới
    onAdd(
      {
        name: tempData.name,
        tag: tempData.tag,
      },
      tempData.day
    );
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
        <Typography variant="h6">Thêm lịch trình</Typography>
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
          <FormControl fullWidth>
            <InputLabel>Ngày thứ</InputLabel>
            <Select
              value={tempData.day}
              onChange={(e) => setTempData({ ...tempData, day: e.target.value })}
              disabled={!isEditing}
              label="Ngày thứ"
            >
              {days.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
              <MenuItem value={`Ngày ${days.length + 1}`}>Ngày {days.length + 1}</MenuItem>
            </Select>
          </FormControl>
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
              minWidth: "800px",
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