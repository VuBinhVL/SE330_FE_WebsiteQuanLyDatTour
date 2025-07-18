import React, { useState, useEffect } from "react";
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
import { fetchGet, fetchPut } from "../../../../lib/httpHandler";
import { toast } from "react-toastify";

export default function TourRouteAttractionDetail({ activity, onClose, onSave, tourRouteId, itinerary }) {
  const [isEditing, setIsEditing] = useState(true);
  const [tempData, setTempData] = useState({
    touristAttractionId: "",
    categoryId: "",
    day: activity?.day || "",
    orderAction: activity?.orderAction || "",
    actionDescription: activity?.actionDescription || "",
  });
  const [categories, setCategories] = useState([]);
  const [touristAttractions, setTouristAttractions] = useState([]);
  const [errors, setErrors] = useState({ orderAction: "", day: "" });

  // Tải danh sách category
  useEffect(() => {
    fetchGet(
      "/api/admin/category",
      (res) => {
        console.log("Tải danh sách category thành công:", res);
        setCategories(res || []);
      },
      (err) => {
        console.error("Lỗi khi tải danh sách category:", err);
        toast.error("Lỗi khi tải danh sách category!", { autoClose: 5000 });
      }
    );
  }, []);

  // Tải danh sách tourist attraction
  useEffect(() => {
    fetchGet(
      "/api/admin/tourist-attraction",
      (res) => {
        console.log("Tải danh sách điểm tham quan thành công:", res);
        setTouristAttractions(res || []);
      },
      (err) => {
        console.error("Lỗi khi tải danh sách điểm tham quan:", err);
        toast.error("Lỗi khi tải danh sách điểm tham quan!", { autoClose: 5000 });
      }
    );
  }, []);

  // Khởi tạo touristAttractionId và categoryId
  useEffect(() => {
    if (touristAttractions.length > 0 && activity?.Tourist_Attraction_Name) {
      const selectedAttraction = touristAttractions.find((attr) => attr.name === activity.Tourist_Attraction_Name);
      if (selectedAttraction) {
        const matchingCategory = categories.find((cat) => cat.name === selectedAttraction.categoryName);
        setTempData((prev) => ({
          ...prev,
          touristAttractionId: selectedAttraction.id || "",
          categoryId: matchingCategory ? matchingCategory.id : "",
        }));
      }
    }
  }, [touristAttractions, categories, activity]);

  // Tính thứ tự lớn nhất trong ngày được chọn
  const getMaxOrderAction = (day) => {
    if (!itinerary || !Array.isArray(itinerary) || !day) {
      return 0;
    }
    const selectedDay = itinerary.find((item) => item.day === `Ngày ${day}`);
    if (!selectedDay || !selectedDay.activities || selectedDay.activities.length === 0) {
      return 0;
    }
    return Math.max(...selectedDay.activities.map((act) => act.orderAction || 0));
  };

  // Lấy danh sách ngày từ itinerary
  const getAvailableDays = () => {
    if (!itinerary || !Array.isArray(itinerary)) {
      return [];
    }
    return itinerary.map((item) => parseInt(item.day.replace("Ngày ", "")));
  };

  // Xử lý thay đổi input và kiểm tra ràng buộc
  const handleInputChange = (field, value) => {
    setTempData((prev) => {
      const newData = { ...prev, [field]: value };

      // Tự động cập nhật categoryId khi chọn touristAttractionId
      if (field === "touristAttractionId") {
        const selectedAttraction = touristAttractions.find((attr) => attr.id === value);
        if (selectedAttraction && selectedAttraction.categoryName) {
          const matchingCategory = categories.find((cat) => cat.name === selectedAttraction.categoryName);
          newData.categoryId = matchingCategory ? matchingCategory.id : "";
        } else {
          newData.categoryId = "";
        }
      }

      // Kiểm tra ràng buộc cho orderAction
      if (field === "orderAction") {
        const orderValue = parseInt(value);
        const maxOrder = getMaxOrderAction(newData.day);
        if (isNaN(orderValue) || orderValue < 1) {
          setErrors({ ...errors, orderAction: "Thứ tự phải là số nguyên dương" });
        } else if (orderValue > maxOrder) {
          setErrors({ ...errors, orderAction: `Thứ tự phải nhỏ hơn hoặc bằng ${maxOrder}` });
        } else {
          setErrors({ ...errors, orderAction: "" });
        }
      }

      // Kiểm tra ràng buộc cho day
      if (field === "day") {
        const dayValue = parseInt(value);
        const availableDays = getAvailableDays();
        if (!availableDays.includes(dayValue)) {
          setErrors({ ...errors, day: "Vui lòng chọn ngày hợp lệ" });
        } else {
          setErrors({ ...errors, day: "" });
        }
      }

      return newData;
    });
  };

  const handleCancelEdit = () => {
    setTempData({
      touristAttractionId: "",
      categoryId: "",
      day: activity?.day || "",
      orderAction: activity?.orderAction || "",
      actionDescription: activity?.actionDescription || "",
    });
    setErrors({ orderAction: "", day: "" });
    onClose();
  };

  const handleConfirmEdit = () => {
    // Kiểm tra ràng buộc
    if (!tempData.touristAttractionId) {
      toast.error("Vui lòng chọn điểm tham quan!", { autoClose: 5000 });
      return;
    }
    if (!tempData.day || errors.day) {
      toast.error(errors.day || "Vui lòng chọn ngày hợp lệ!", { autoClose: 5000 });
      return;
    }
    if (!tempData.orderAction || errors.orderAction) {
      toast.error(errors.orderAction || "Vui lòng nhập thứ tự hợp lệ!", { autoClose: 5000 });
      return;
    }

    // Gọi API để cập nhật hoạt động
    const payload = {
      tourRouteId: tourRouteId,
      touristAttractionId: parseInt(tempData.touristAttractionId),
      orderAction: parseInt(tempData.orderAction),
      day: parseInt(tempData.day),
      actionDescription: tempData.actionDescription,
    };

    console.log("Gửi request PUT:", {
      url: `/api/admin/tour-route-attraction/update/${activity.id}`,
      payload,
    });

    fetchPut(
      `/api/admin/tour-route-attraction/update/${activity.id}`,
      payload,
      (res) => {
        const selectedAttraction = touristAttractions.find((attr) => attr.id === tempData.touristAttractionId);
        const selectedCategory = categories.find((cat) => cat.name === selectedAttraction?.categoryName);

        // Cập nhật hoạt động đã chỉnh sửa
        const updatedActivity = {
          id: activity.id,
          Tourist_Attraction_Name: selectedAttraction?.name || "",
          category: selectedCategory?.name || "",
          actionDescription: tempData.actionDescription,
          orderAction: parseInt(tempData.orderAction),
          day: parseInt(tempData.day),
        };

        // Gọi onSave với thông tin hoạt động đã cập nhật
        onSave(updatedActivity);

        toast.success("Cập nhật lịch trình thành công!", { autoClose: 3000 });
        onClose();
      },
      (err) => {
        console.error("Lỗi khi cập nhật lịch trình:", err);
        toast.error(err.data?.message || "Lỗi khi cập nhật lịch trình!", { autoClose: 5000 });
      }
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
        <Typography variant="h6">Thông tin lịch trình</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Địa điểm</InputLabel>
            <Select
              value={tempData.touristAttractionId}
              onChange={(e) => handleInputChange("touristAttractionId", e.target.value)}
              disabled={!isEditing}
              label="Địa điểm"
            >
              {touristAttractions.length === 0 ? (
                <MenuItem disabled>Không có điểm tham quan</MenuItem>
              ) : (
                touristAttractions.map((attraction) => (
                  <MenuItem key={attraction.id} value={attraction.id}>
                    {attraction.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Loại địa điểm</InputLabel>
            <Select
              value={tempData.categoryId}
              onChange={(e) => handleInputChange("categoryId", e.target.value)}
              disabled={true}
              label="Loại địa điểm"
            >
              {categories.length === 0 ? (
                <MenuItem disabled>Không có danh mục</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ minWidth: 100 }}>
            <InputLabel>Ngày thứ</InputLabel>
            <Select
              value={tempData.day}
              onChange={(e) => handleInputChange("day", e.target.value)}
              disabled={true}
              label="Ngày thứ"
            >
              {getAvailableDays().length === 0 ? (
                <MenuItem disabled>Không có ngày</MenuItem>
              ) : (
                getAvailableDays().map((day) => (
                  <MenuItem key={day} value={day}>
                    Ngày {day}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Thứ tự"
            type="number"
            fullWidth
            value={tempData.orderAction}
            onChange={(e) => handleInputChange("orderAction", e.target.value)}
            disabled={!isEditing}
            error={!!errors.orderAction}
            helperText={errors.orderAction}
            inputProps={{ min: 1 }}
            sx={{ maxWidth: 100 }}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            label="Mô tả hoạt động"
            fullWidth
            multiline
            minRows={4}
            value={tempData.actionDescription}
            onChange={(e) => handleInputChange("actionDescription", e.target.value)}
            disabled={!isEditing}
            sx={{
              mt: 2,
              minWidth: 800,
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