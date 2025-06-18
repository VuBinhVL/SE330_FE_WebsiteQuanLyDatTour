import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Typography, TextField, Grid, Paper, Chip, IconButton, Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import searchIcon from "../../../../assets/icons/customer/header/search.png"; // thay icon khác sau

export default function DetailTourRoute() {
  const { id } = useParams();
  const [tourRoute, setTourRoute] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleDays, setVisibleDays] = useState([0, 1, 2]); // chỉ hiển thị 3 ngày mỗi lần

  useEffect(() => {
    setTourRoute({
      name: "Thái Lan: Bangkok - Pattaya (Chợ nổi Bốn Miền, chùa Phật Lớn...)",
      departure: "Đà Nẵng",
      destination: "Bangkok - Thailan",
      startDate: "01/01/2025",
      endDate: "01/01/2026",
      duration: "3N2Đ"
    });
  }, [id]);

  const itinerary = [
    {
      day: "Ngày 1",
      activities: [
        { name: "Sân bay Tân Sơn Nhất", tag: "Sân bay" },
        { name: "Sông Chao Phraya", tag: "Sông suối" },
        { name: "Khách sạn Bangkok", tag: "Khách sạn" },
      ],
    },
    {
      day: "Ngày 2",
      activities: [
        { name: "Cung điện hoàng gia", tag: "Di tích lịch sử" },
        { name: "Biển Pattaya", tag: "Bãi biển" },
        { name: "Làng Nong Nooch", tag: "Làng nghề" },
        { name: "Khách sạn Bangkok", tag: "Khách sạn" },
      ],
    },
    {
      day: "Ngày 3",
      activities: [
        { name: "Cung điện hoàng gia", tag: "Di tích lịch sử" },
        { name: "Biển Pattaya", tag: "Bãi biển" },
        { name: "Làng Nong Nooch", tag: "Làng nghề" },
        { name: "Khách sạn Bangkok", tag: "Khách sạn" },
      ],
    },
    {
      day: "Ngày 4",
      activities: [
        { name: "Chợ nổi Pattaya", tag: "Chợ" },
        { name: "China Town", tag: "Khu phố" },
      ]
    },
    {
      day: "Ngày 5",
      activities: [
        { name: "Colosseum Show", tag: "Giải trí" },
        { name: "Ăn bánh quay sốt", tag: "Ẩm thực" }
      ]
    }
  ];

  const handleToggleEdit = () => setIsEditing(!isEditing);

  const handleScrollLeft = () => {
    if (visibleDays[0] > 0) {
      setVisibleDays(visibleDays.map(i => i - 1));
    }
  };

  const handleScrollRight = () => {
    if (visibleDays[visibleDays.length - 1] < itinerary.length - 1) {
      setVisibleDays(visibleDays.map(i => i + 1));
    }
  };

  if (!tourRoute) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      {/* Thông tin chính có viền */}
      <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Tên tuyến du lịch</Typography>
          <IconButton onClick={handleToggleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={tourRoute.name}
          onChange={(e) => setTourRoute({ ...tourRoute, name: e.target.value })}
          disabled={!isEditing}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Khởi hành"
              fullWidth
              value={tourRoute.departure}
              onChange={(e) => setTourRoute({ ...tourRoute, departure: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Điểm đến"
              fullWidth
              value={tourRoute.destination}
              onChange={(e) => setTourRoute({ ...tourRoute, destination: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Ngày bắt đầu"
              fullWidth
              value={tourRoute.startDate}
              onChange={(e) => setTourRoute({ ...tourRoute, startDate: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Ngày kết thúc"
              fullWidth
              value={tourRoute.endDate}
              onChange={(e) => setTourRoute({ ...tourRoute, endDate: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Thời gian"
              fullWidth
              value={tourRoute.duration}
              onChange={(e) => setTourRoute({ ...tourRoute, duration: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Lịch trình */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Typography variant="h6" textAlign="center" sx={{ mr: 1 }}>
          LỊCH TRÌNH
        </Typography>
        <IconButton sx={{ color: "green" }}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>

      <Box display="flex" alignItems="center">
        <IconButton onClick={handleScrollLeft}>
          <ArrowBackIosIcon />
        </IconButton>

        <Grid container spacing={2} flex={1}>
          {visibleDays.map((dayIndex) => {
            const day = itinerary[dayIndex];
            return (
              <Grid item xs={12} md={4} key={dayIndex}>
                <Paper sx={{ p: 2, borderRadius: 2, minHeight: "300px" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">{day.day}</Typography>
                    <IconButton size="small" color="success"><AddCircleOutlineIcon /></IconButton>
                  </Box>
                  {day.activities.map((activity, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <img src={searchIcon} alt="icon" width={16} height={16} style={{ marginRight: 6 }} />
                        <Box>
                          <Typography fontSize="14px">{activity.name}</Typography>
                          <Chip
                            label={activity.tag}
                            size="small"
                            sx={{ backgroundColor: "#7b1fa2", color: "#fff" }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Tooltip title="Sửa">
                          <IconButton size="small" color="primary">
                            <ModeEditOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xoá hoạt động">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <IconButton onClick={handleScrollRight}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
