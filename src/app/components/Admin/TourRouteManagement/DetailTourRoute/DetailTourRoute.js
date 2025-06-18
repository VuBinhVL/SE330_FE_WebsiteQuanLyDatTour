import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TourRouteAttractionDetail from "../../../Admin/TourRouteManagement/TourRouteAttractionDetail/TourRouteAttractionDetail";
import AddTourRouteAttraction from "../../../Admin/TourRouteManagement/AddTourRouteAttraction/AddTourRouteAttraction";

export default function DetailTourRoute() {
  const { id } = useParams();
  const [tourRoute, setTourRoute] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleDays, setVisibleDays] = useState([0, 1, 2]);
  const [tempData, setTempData] = useState({});
  const [openAttractionDialog, setOpenAttractionDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [openAddAttractionDialog, setOpenAddAttractionDialog] = useState(false);
  const [itinerary, setItinerary] = useState([
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
      ],
    },
    {
      day: "Ngày 5",
      activities: [
        { name: "Colosseum Show", tag: "Giải trí" },
        { name: "Ăn bánh quay sốt", tag: "Ẩm thực" },
      ],
    },
  ]);

  useEffect(() => {
    const data = {
      name: "Thái Lan: Bangkok - Pattaya (Chợ nổi Bốn Miền, chùa Phật Lớn...)",
      departure: "Đà Nẵng",
      destination: "Bangkok - Thailan",
      startDate: "01/01/2025",
      endDate: "01/01/2026",
      duration: "3N2Đ",
    };
    setTourRoute(data);
    setTempData(data);
  }, [id]);

  const handleToggleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTempData(tourRoute);
    setIsEditing(false);
  };

  const handleConfirmEdit = () => {
    setTourRoute(tempData);
    setIsEditing(false);
  };

  const handleScrollLeft = () => {
    if (visibleDays[0] > 0) {
      setVisibleDays(visibleDays.map((i) => i - 1));
    }
  };

  const handleScrollRight = () => {
    if (visibleDays[visibleDays.length - 1] < itinerary.length - 1) {
      setVisibleDays(visibleDays.map((i) => i + 1));
    }
  };

  const handleEditActivity = (dayIndex, activity) => {
    setSelectedDayIndex(dayIndex);
    setSelectedActivity(activity);
    setOpenAttractionDialog(true);
  };

  const handleCloseAttractionDialog = () => {
    setOpenAttractionDialog(false);
    setSelectedActivity(null);
    setSelectedDayIndex(null);
  };

  const handleSaveActivity = (updatedActivity) => {
    setItinerary((prevItinerary) => {
      const newItinerary = [...prevItinerary];
      const activities = [...newItinerary[selectedDayIndex].activities];
      const activityIndex = activities.findIndex((act) => act.name === selectedActivity.name);
      activities[activityIndex] = updatedActivity;
      newItinerary[selectedDayIndex].activities = activities;
      return newItinerary;
    });
    handleCloseAttractionDialog();
  };

  const handleOpenAddAttractionDialog = () => {
    setOpenAddAttractionDialog(true);
  };

  const handleCloseAddAttractionDialog = () => {
    setOpenAddAttractionDialog(false);
  };

  const handleAddActivity = (newActivity, selectedDay) => {
    setItinerary((prevItinerary) => {
      const newItinerary = [...prevItinerary];
      const dayIndex = newItinerary.findIndex((item) => item.day === selectedDay);
      if (dayIndex !== -1) {
        newItinerary[dayIndex].activities.push(newActivity);
      } else {
        // Nếu ngày không tồn tại, tạo ngày mới
        newItinerary.push({
          day: selectedDay,
          activities: [newActivity],
        });
      }
      return newItinerary;
    });
    handleCloseAddAttractionDialog();
  };

  if (!tourRoute) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      {/* Thông tin tuyến */}
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          mb: 3,
          position: "relative",
        }}
      >
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
            <TextField
              label="Ngày bắt đầu"
              fullWidth
              value={tempData.startDate}
              onChange={(e) => setTempData({ ...tempData, startDate: e.target.value })}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Ngày kết thúc"
              fullWidth
              value={tempData.endDate}
              onChange={(e) => setTempData({ ...tempData, endDate: e.target.value })}
              disabled={!isEditing}
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

      {/* Lịch trình */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Typography variant="h6" textAlign="center" sx={{ mr: 1 }}>
          LỊCH TRÌNH
        </Typography>
        <IconButton sx={{ color: "green" }} onClick={handleOpenAddAttractionDialog}>
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
              <Grid item xs={12} md={6} key={dayIndex}>
                <Paper sx={{ p: 2, borderRadius: 2, minHeight: "300px", minWidth: "300px", marginRight: "10px" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {day.day}
                    </Typography>
                    <IconButton size="small" color="success">
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {day.activities.map((activity, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        mb: 2,
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          pl: 1,
                          borderLeft: "3px solid",
                          borderImage: "linear-gradient(to bottom, red, orange, yellow, green, blue, indigo, violet) 1",
                        }}
                      >
                        <Typography fontSize="14px">{activity.name}</Typography>
                        <Box>
                          <Tooltip title="Sửa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditActivity(dayIndex, activity)}
                            >
                              <ModeEditOutlineIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xoá hoạt động">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flex-start"
                        alignItems="center"
                        mt={1}
                      >
                        <Chip
                          label={activity.tag}
                          size="small"
                          sx={{ backgroundColor: "#4D40CA", borderRadius: 10, color: "#fff" }}
                        />
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

      {/* Dialog để hiển thị TourRouteAttractionDetail */}
      <Dialog
        open={openAttractionDialog}
        onClose={handleCloseAttractionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thông tin lịch trình</DialogTitle>
        <DialogContent>
          <TourRouteAttractionDetail
            activity={selectedActivity}
            day={itinerary[selectedDayIndex]?.day}
            onClose={handleCloseAttractionDialog}
            onSave={handleSaveActivity}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog để hiển thị AddTourRouteAttraction */}
      <Dialog
        open={openAddAttractionDialog}
        onClose={handleCloseAddAttractionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thêm lịch trình</DialogTitle>
        <DialogContent>
          <AddTourRouteAttraction
            onClose={handleCloseAddAttractionDialog}
            onAdd={handleAddActivity}
            days={itinerary.map((item) => item.day)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}