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
import { fetchGet, fetchPost } from "../../../../lib/httpHandler";
import { toast } from "react-toastify";

export default function AddTourRouteAttraction({ onClose, onAdd, days, itinerary, tourRouteId }) {
  const [isEditing, setIsEditing] = useState(true);
  const [tempData, setTempData] = useState({
    touristAttractionId: "",
    categoryId: "",
    day: "",
    orderAction: "",
    actionDescription: "",
  });
  const [categories, setCategories] = useState([]);
  const [touristAttractions, setTouristAttractions] = useState([]);
  const [errors, setErrors] = useState({ day: "", orderAction: "" });
  const [tourRouteDuration, setTourRouteDuration] = useState(0); // Số ngày của hành trình

  // Tải thông tin tourRoute để tính số ngày
  useEffect(() => {
    fetchGet(
      `/api/admin/tour-route/get/${tourRouteId}`,
      (res) => {
        const startDate = new Date(res.data.startDate);
        const endDate = new Date(res.data.endDate);
        // Tính số ngày: (endDate - startDate) / (1000 * 60 * 60 * 24) + 1
        const duration = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        setTourRouteDuration(duration);
        console.log("Số ngày của tourRoute:", duration);
      },
      (err) => {
        console.error("Lỗi khi tải thông tin tourRoute:", err);
        toast.error("Lỗi khi tải thông tin tourRoute!", { autoClose: 5000 });
      }
    );
  }, [tourRouteId]);

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
      },
      () => {
        console.log("Tải danh sách category xong");
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
      },
      () => {
        console.log("Tải danh sách điểm tham quan xong");
      }
    );
  }, []);

  // Tính ngày lớn nhất từ days
  const maxDay = days.length > 0 ? Math.max(...days.map((day) => parseInt(day.split(" ")[1]))) : 0;

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

      // Kiểm tra ràng buộc cho day
      if (field === "day") {
        const dayValue = parseInt(value);
        if (isNaN(dayValue) || dayValue <= 0) {
          setErrors({ ...errors, day: "Ngày phải lớn hơn 0" });
        } else if (dayValue > tourRouteDuration) {
          setErrors({ ...errors, day: `Ngày phải nhỏ hơn hoặc bằng ${tourRouteDuration}` });
        } else if (dayValue >= maxDay + 2) {
          setErrors({ ...errors, day: `Ngày phải nhỏ hơn ${maxDay + 2}` });
        } else {
          setErrors({ ...errors, day: "" });
        }
      }

      // Kiểm tra ràng buộc cho orderAction
      if (field === "orderAction") {
        const orderValue = parseInt(value);
        const maxOrder = getMaxOrderAction(newData.day);
        if (isNaN(orderValue) || orderValue <= maxOrder) {
          setErrors({ ...errors, orderAction: `Thứ tự phải lớn hơn ${maxOrder}` });
        } else if (orderValue >= maxOrder + 2) {
          setErrors({ ...errors, orderAction: `Thứ tự phải nhỏ hơn ${maxOrder + 2}` });
        } else {
          setErrors({ ...errors, orderAction: "" });
        }
      }

      return newData;
    });
  };

  const handleCancelEdit = () => {
    setTempData({
      touristAttractionId: "",
      categoryId: "",
      day: "",
      orderAction: "",
      actionDescription: "",
    });
    setErrors({ day: "", orderAction: "" });
    onClose();
  };

  const handleConfirmEdit = () => {
    // Kiểm tra ràng buộc
    if (!tempData.touristAttractionId) {
      toast.error("Vui lòng chọn điểm tham quan!");
      return;
    }
    if (!tempData.categoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }
    if (!tempData.day || errors.day) {
      toast.error(errors.day || "Vui lòng nhập ngày hợp lệ!");
      return;
    }
    if (!tempData.orderAction || errors.orderAction) {
      toast.error(errors.orderAction || "Vui lòng nhập thứ tự hợp lệ!");
      return;
    }

    // Gọi API để tạo hoạt động
    const payload = {
      tourRouteId: tourRouteId,
      touristAttractionId: parseInt(tempData.touristAttractionId),
      categoryId: parseInt(tempData.categoryId),
      orderAction: parseInt(tempData.orderAction),
      day: parseInt(tempData.day),
      actionDescription: tempData.actionDescription,
    };

    fetchPost(
      "/api/admin/tour-route-attraction/create",
      payload,
      (res) => {
        const selectedAttraction = touristAttractions.find((attr) => attr.id === tempData.touristAttractionId);
        const selectedCategory = categories.find((cat) => cat.id === tempData.categoryId);

        // Cập nhật state cục bộ qua onAdd
        onAdd(
          {
            id: res.data.id,
            Tourist_Attraction_Name: selectedAttraction?.name || "",
            category: selectedCategory?.name || "",
            actionDescription: tempData.actionDescription,
            orderAction: parseInt(tempData.orderAction),
            day: parseInt(tempData.day),
          },
          `Ngày ${tempData.day}`
        );

        toast.success("Thêm lịch trình thành công!", { autoClose: 3000 });
        onClose();
      },
      (err) => {
        console.log("Lỗi khi thêm lịch trình:", err);
        toast.error(err.response?.data?.message || "Lỗi khi thêm lịch trình!", { autoClose: 5000 });
      },
      () => {
        console.log("Thêm lịch trình xong");
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
        <Typography variant="h6">Thêm lịch trình</Typography>
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
              disabled={true} // Vô hiệu hóa combobox
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
          <TextField
            label="Ngày thứ"
            type="number"
            fullWidth
            value={tempData.day}
            onChange={(e) => handleInputChange("day", e.target.value)}
            disabled={!isEditing}
            error={!!errors.day}
            helperText={errors.day}
            inputProps={{ min: 1, max: Math.min(maxDay + 2, tourRouteDuration) }}
            sx={{ minWidth: 100 }}
          />
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
              minWidth: 800,
              mt: 2,
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