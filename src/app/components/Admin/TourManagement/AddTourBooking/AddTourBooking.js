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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function AddTourBooking({ onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    gender: "",
    dob: null,
    email: "",
    phone: "",
    address: "",
  });
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([
    {
      fullName: "",
      gender: "",
      dob: null,
      email: "",
      phone: "",
      isContact: false,
    },
  ]);
  const [contactIndex, setContactIndex] = useState(-1);

  const genderOptions = ["Nam", "Nữ", "Khác"];

  const handleCustomerChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const newPassengers = [...prev];
      newPassengers[index] = { ...newPassengers[index], [field]: value };
      return newPassengers;
    });
  };

  const handleContactChange = (index) => {
    setPassengers((prev) => {
      const newPassengers = prev.map((passenger, i) => ({
        ...passenger,
        isContact: i === index,
      }));
      return newPassengers;
    });
    setContactIndex(index);
  };

  const handlePassengerCountChange = (value) => {
    const count = Math.max(1, parseInt(value) || 1);
    setPassengerCount(count);
    setPassengers((prev) => {
      const newPassengers = Array(count)
        .fill()
        .map((_, i) =>
          prev[i] || {
            fullName: "",
            gender: "",
            dob: null,
            email: "",
            phone: "",
            isContact: false,
          }
        );
      if (contactIndex >= count) {
        setContactIndex(-1);
        return newPassengers.map((p) => ({ ...p, isContact: false }));
      }
      return newPassengers;
    });
  };

  const handleCancel = () => {
    setCustomerInfo({
      fullName: "",
      gender: "",
      dob: null,
      email: "",
      phone: "",
      address: "",
    });
    setPassengerCount(1);
    setPassengers([
      {
        fullName: "",
        gender: "",
        dob: null,
        email: "",
        phone: "",
        isContact: false,
      },
    ]);
    setContactIndex(-1);
    onClose();
  };

  const handleConfirm = () => {
    const newBooking = {
      id: `BK${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
      fullName: customerInfo.fullName,
      gender: customerInfo.gender,
      phone: customerInfo.phone,
      email: customerInfo.email,
      booker: passengers.find((p) => p.isContact)?.fullName || customerInfo.fullName,
    };
    onSave(newBooking);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>
          Thêm phiếu đặt chỗ mới
        </Typography>

        {/* Box 1: Thông tin khách hàng */}
        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Thông tin khách hàng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Họ và tên"
                fullWidth
                value={customerInfo.fullName}
                onChange={(e) => handleCustomerChange("fullName", e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth sx={{minWidth : 120}}>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={customerInfo.gender}
                  onChange={(e) => handleCustomerChange("gender", e.target.value)}
                  disabled={!isEditing}
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Ngày sinh"
                value={customerInfo.dob}
                onChange={(newValue) => handleCustomerChange("dob", newValue)}
                disabled={!isEditing}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                fullWidth
                value={customerInfo.email}
                onChange={(e) => handleCustomerChange("email", e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Số điện thoại"
                fullWidth
                value={customerInfo.phone}
                onChange={(e) => handleCustomerChange("phone", e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Địa chỉ"
                fullWidth
                value={customerInfo.address}
                onChange={(e) => handleCustomerChange("address", e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Box 2: Thông tin hành khách */}
        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Thông tin hành khách
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Số lượng hành khách"
                type="number"
                fullWidth
                value={passengerCount}
                onChange={(e) => handlePassengerCountChange(e.target.value)}
                disabled={!isEditing}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
          {passengers.map((passenger, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 2,
                mb: 2,
                backgroundColor: passenger.isContact ? "#f5f5f5" : "transparent",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">
                  Thông tin hành khách {index + 1}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={passenger.isContact}
                      onChange={() => handleContactChange(index)}
                      disabled={!isEditing}
                    />
                  }
                  label="Người liên hệ"
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                  sx={{maxWidth : 200}}
                    label="Họ và tên"
                    fullWidth
                    value={passenger.fullName}
                    onChange={(e) => handlePassengerChange(index, "fullName", e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{minWidth : 120}}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                      disabled={!isEditing}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="Ngày sinh"
                    value={passenger.dob}
                    onChange={(newValue) => handlePassengerChange(index, "dob", newValue)}
                    disabled={!isEditing}
                    renderInput={(params) => <TextField {...params} fullWidth  />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, "email", e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                  sx={{maxWidth : 180}}
                    label="Số điện thoại"
                    fullWidth
                    value={passenger.phone}
                    onChange={(e) => handlePassengerChange(index, "phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>

        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button variant="outlined" onClick={handleCancel}>
              Huỷ
            </Button>
            <Button variant="contained" onClick={handleConfirm}>
              Xác nhận
            </Button>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}