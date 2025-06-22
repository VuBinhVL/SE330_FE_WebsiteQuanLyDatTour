import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchGet, fetchPut, fetchUpload, fetchDelete, BE_ENDPOINT } from "../../../../lib/httpHandler";
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
  Input,
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
  const [itinerary, setItinerary] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleDays, setVisibleDays] = useState([0, 1, 2]);
  const [tempData, setTempData] = useState({});
  const [openAttractionDialog, setOpenAttractionDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [openAddAttractionDialog, setOpenAddAttractionDialog] = useState(false);
  const [isItineraryLoading, setIsItineraryLoading] = useState(true);

  // Hàm tải lại itinerary từ backend
  const fetchItinerary = () => {
    setIsItineraryLoading(true);
    fetchGet(
      `/api/admin/tour-route-attraction/tour-route/${id}`,
      (res) => {
        const attractions = res.data;
        const groupedByDay = attractions.reduce((acc, attraction) => {
          const dayKey = `Ngày ${attraction.day}`;
          if (!acc[dayKey]) {
            acc[dayKey] = {
              day: dayKey,
              activities: [],
            };
          }
          acc[dayKey].activities.push({
            id: attraction.id,
            Tourist_Attraction_Name: attraction.touristAttraction.name,
            category: attraction.category.name,
            actionDescription: attraction.actionDescription,
            orderAction: attraction.orderAction,
            day: attraction.day,
          });
          return acc;
        }, {});

        const itineraryData = Object.values(groupedByDay).sort((a, b) => {
          const dayA = parseInt(a.day.split(" ")[1]);
          const dayB = parseInt(b.day.split(" ")[1]);
          return dayA - dayB;
        });

        // Sắp xếp activities theo orderAction
        itineraryData.forEach((day) => {
          day.activities.sort((a, b) => a.orderAction - b.orderAction);
        });

        setItinerary(itineraryData);
        setIsItineraryLoading(false);
      },
      (err) => {
        console.error("Lỗi khi tải lịch trình:", err);
        toast.error("Lỗi khi tải lịch trình!", { autoClose: 5000 });
        setIsItineraryLoading(false);
      }
    );
  };

  useEffect(() => {
    // Tải thông tin tuyến du lịch
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
          image: res.data.image || "https://via.placeholder.com/36",
          imagePreview: res.data.image?.startsWith("http")
            ? res.data.image
            : BE_ENDPOINT + (res.data.image || "/api/asset/view-image/placeholder.jpg"),
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

    // Tải lịch trình
    fetchItinerary();
  }, [id]);

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

  const handleToggleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
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

    const updateTourRoute = () => {
      const tourRouteDTO = {
        routeName: tempData.name,
        startLocation: tempData.departure,
        endLocation: tempData.destination,
        startDate: tempData.startDate ? new Date(tempData.startDate.setHours(0, 0, 0, 0)).toISOString() : null,
        endDate: tempData.endDate ? new Date(tempData.endDate.setHours(23, 59, 59, 999)).toISOString() : null,
        image: tempData.imagePreview?.startsWith("http")
          ? tempData.imagePreview
          : BE_ENDPOINT + (tempData.imagePreview || "/api/asset/view-image/placeholder.jpg"),
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
            image: res.data.image || "https://via.placeholder.com/36",
            imagePreview: res.data.image?.startsWith("http")
              ? res.data.image
              : BE_ENDPOINT + (res.data.image || "/api/asset/view-image/placeholder.jpg"),
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

    if (tempData.image instanceof File) {
      const formData = new FormData();
      formData.append("image", tempData.image);

      fetchUpload(
        "/api/asset/upload-image",
        formData,
        (res) => {
          tempData.imagePreview = BE_ENDPOINT + res.data;
          updateTourRoute();
        },
        (err) => {
          console.error("Lỗi khi upload ảnh:", err);
          toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi upload ảnh", { autoClose: 5000 });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng khi upload ảnh!", { autoClose: 5000 });
        }
      );
    } else {
      updateTourRoute();
    }
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

  const handleDeleteActivity = (dayIndex, activityId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      return;
    }

    fetchDelete(
      `/api/admin/tour-route-attraction/delete/${activityId}`,
      (res) => {
        // Tải lại danh sách itinerary từ backend để đảm bảo đồng bộ
        fetchItinerary();
        toast.success(res.message || "Xóa hoạt động thành công!", { autoClose: 3000 });
      },
      (err) => {
        console.error("Lỗi khi xóa hoạt động:", err);
        toast.error(err.message || "Lỗi khi xóa hoạt động!", { autoClose: 5000 });
      },
      () => {
        console.log("Xóa hoạt động hoàn tất");
      }
    );
  };

  const handleCloseAttractionDialog = () => {
    setOpenAttractionDialog(false);
    setSelectedActivity(null);
    setSelectedDayIndex(null);
  };

  const handleSaveActivity = (updatedActivity) => {
    // Tải lại dữ liệu từ backend để đảm bảo đồng bộ
    fetchItinerary();
    handleCloseAttractionDialog();
  };

  const handleOpenAddAttractionDialog = () => {
    if (isItineraryLoading) {
      toast.warn("Vui lòng đợi dữ liệu lịch trình tải xong!");
      return;
    }
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
        // Sắp xếp lại activities theo orderAction
        newItinerary[dayIndex].activities.sort((a, b) => a.orderAction - b.orderAction);
      } else {
        newItinerary.push({
          day: selectedDay,
          activities: [newActivity],
        });
        newItinerary.sort((a, b) => {
          const dayA = parseInt(a.day.split(" ")[1]);
          const dayB = parseInt(b.day.split(" ")[1]);
          return dayA - dayB;
        });
      }
      return newItinerary;
    });
    handleCloseAddAttractionDialog();
    // Tải lại dữ liệu từ backend để đảm bảo đồng bộ
    fetchItinerary();
  };

  if (!tourRoute) return <Typography>Đang tải...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
      <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
        <ToastContainer />
        {isItineraryLoading && <Typography>Đang tải lịch trình...</Typography>}
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 2,
            mb: 3,
            position: "relative",
          }}
        >
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                component="img"
                src={
                  tempData.imagePreview?.startsWith("http")
                    ? tempData.imagePreview
                    : BE_ENDPOINT + (tempData.imagePreview || "/api/asset/view-image/placeholder.jpg")
                }
                alt="Tuyến du lịch"
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
                onError={(e) => (e.target.src = "https://via.placeholder.com/36")}
              />
              {isEditing && (
                <Box>
                  <Typography variant="body1" mb={1}>Tải ảnh mới</Typography>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
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
                Hủy
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
              if (dayIndex >= itinerary.length) return null;
              const day = itinerary[dayIndex];
              return (
                <Grid item xs={12} md={6} key={dayIndex}>
                  <Paper sx={{ p: 2, borderRadius: 2, minHeight: "300px", minWidth: "300px", marginRight: "10px" }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {day.day}
                      </Typography>
                      {/* <IconButton size="small" color="success">
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton> */}
                    </Box>
                    {day.activities
                      .sort((a, b) => a.orderAction - b.orderAction)
                      .map((activity, i) => (
                        <Box
                          key={activity.id}
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
                            <Typography fontSize="14px">{activity.Tourist_Attraction_Name}</Typography>
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
                              <Tooltip title="Xóa hoạt động">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteActivity(dayIndex, activity.id)}
                                >
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
                              label={activity.category}
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
              tourRouteId={id}
              itinerary={itinerary}
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
              itinerary={itinerary}
              tourRouteId={id}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}