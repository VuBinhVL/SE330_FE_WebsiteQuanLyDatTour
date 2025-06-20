import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchGet, fetchPut } from "../../../../lib/httpHandler";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import viLocale from "date-fns/locale/vi";

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
    fetchGet(
      `/api/admin/tour-route/get/${id}`,
      (res) => {
        const tourRouteData = {
          id: res.data.id,
          name: res.data.routeName,
          departure: res.data.startLocation,
          destination: res.data.endLocation,
          startDate: res.data.startDate ? new Date(res.data.startDate) : null,
          endDate: res.data.endDate ? new Date(res.data.endDate) : null,
        };
        setTourRoute(tourRouteData);
        setTempData(tourRouteData);
      },
      (err) => {
        console.error("Lỗi khi tải thông tin tuyến du lịch:", err);
        setTourRoute(null);
        toast.error("Lỗi khi tải thông tin tuyến du lịch!", { autoClose: 5000 });
      }
    );
  }, [id]);

  const handleToggleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEditCancel = () => {
    setTempData(tourRoute);
    setIsEditing(false);
  };

  const handleConfirmEdit = () => {
    const errors = [];

    if (!tempData?.name) {
      errors.push("Tên tuyến du lịch không được để trống");
    }

    if (!tempData?.departure) {
      errors.push("Điểm khởi hành không được để trống");
    }

    if (!tempData?.destination) {
      errors.push("Điểm đến không được để trống");
    }

    if (!tempData?.startDate) {
      errors.push("Ngày bắt đầu không được để trống");
    }

    if (!tempData?.endDate) {
      errors.push("Ngày kết thúc không được để trống");
    } else if (tempData.startDate && tempData.endDate && tempData.endDate < tempData.startDate) {
      errors.push("Ngày kết thúc phải sau ngày bắt đầu");
    }

    if (errors.length > 0) {
      toast.error("Vui lòng kiểm tra lại:\n" + errors.join("\n"), {
        autoClose: 5000,
      });
      return;
    }

    const tourRouteDTO = {
      routeName: tempData.name,
      startLocation: tempData.departure,
      endLocation: tempData.destination,
      startDate: tempData.startDate ? new Date(tempData.startDate.setHours(0, 0, 0, 0)).toISOString() : null,
      endDate: tempData.endDate ? new Date(tempData.endDate.setHours(23, 59, 59, 999)).toISOString() : null,
    };

    fetchPut(
      `/api/admin/tour-route/update/${id}`,
      tourRouteDTO,
      (res) => {
        const updatedTourRoute = {
          id: res.data.id,
          name: res.data.routeName,
          departure: res.data.startLocation,
          destination: res.data.endLocation,
          startDate: res.data.startDate ? new Date(res.data.startDate) : null,
          endDate: res.data.endDate ? new Date(res.data.endDate) : null,
        };
        setTourRoute(updatedTourRoute);
        setTempData(updatedTourRoute);
        setIsEditing(false);
        toast.success(res.message || "Cập nhật tuyến du lịch thành công!", { autoClose: 3000 });
      },
      (err) => {
        console.error("Lỗi cập nhật tuyến du lịch:", err);
        toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật tuyến du lịch", { autoClose: 5000 });
      }
    );
  };
  const handleCancelEdit = () => {
  setTempData(tourRoute);
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
      <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
        <ToastContainer />
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
            value={tempData.name || ""}
            onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
            disabled={!isEditing}
            sx={{ mb: 3 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Khởi hành"
                fullWidth
                value={tempData.departure || ""}
                onChange={(e) => setTempData({ ...tempData, departure: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Điểm đến"
                fullWidth
                value={tempData.destination || ""}
                onChange={(e) => setTempData({ ...tempData, destination: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Ngày bắt đầu"
                value={tempData.startDate}
                onChange={(newValue) => setTempData({ ...tempData, startDate: newValue })}
                disabled={!isEditing}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Ngày kết thúc"
                value={tempData.endDate}
                onChange={(newValue) => setTempData({ ...tempData, endDate: newValue })}
                disabled={!isEditing}
                renderInput={(params) => <TextField {...params} fullWidth />}
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
    </LocalizationProvider>
  );
}