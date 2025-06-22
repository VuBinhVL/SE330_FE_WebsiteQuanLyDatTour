import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fetchGet, fetchPost } from "../../../../lib/httpHandler";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function AddTourBooking({ onClose, onSave, tourId }) {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    id: null,
    fullName: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([
    {
      id: null,
      fullName: "",
      gender: "",
      dob: "",
      email: "",
      phone: "",
      isContact: true, // Mặc định hành khách đầu tiên là người liên hệ
    },
  ]);
  const [contactIndex, setContactIndex] = useState(0); // Mặc định chọn hành khách đầu tiên
  const [users, setUsers] = useState([]);
  const [userMembers, setUserMembers] = useState({});
  const [tourPrice, setTourPrice] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt"); // Mặc định phương thức thanh toán

  useEffect(() => {
    // Fetch danh sách users cho combobox
    fetchGet(
      "/api/admin/user/get-all",
      (res) => {
        setUsers(res.data || []);
      },
      (err) => {
        console.error("Lỗi lấy danh sách users:", err);
        toast.error("Lỗi khi tải danh sách khách hàng!", { autoClose: 5000 });
      }
    );

    // Fetch giá tour
    fetchGet(
      `/api/admin/tour/get/${id}`,
      (res) => {
        setTourPrice(res.data.price || 0);
      },
      (err) => {
        console.error("Lỗi lấy thông tin tour:", err);
        toast.error("Lỗi khi tải thông tin tour!", { autoClose: 5000 });
      }
    );
  }, [id]);

  useEffect(() => {
    // Tính tổng tiền khi số lượng hành khách thay đổi
    if (tourPrice) {
      setTotalPrice(tourPrice * passengerCount);
    }
  }, [tourPrice, passengerCount]);

  const fetchUserMembers = (userId) => {
    if (!userMembers[userId]) {
      fetchGet(
        `/api/admin/user-member/user/${userId}`,
        (res) => {
          setUserMembers((prev) => ({
            ...prev,
            [userId]: res.data || [],
          }));
        },
        (err) => {
          console.error(`Lỗi lấy user members cho user ${userId}:`, err);
          toast.error("Lỗi khi tải danh sách hành khách!", { autoClose: 5000 });
        }
      );
    }
  };

  const handleCustomerChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (user) => {
    if (user) {
      setCustomerInfo({
        id: user.id,
        fullName: user.fullname,
        gender: user.sex ? "Nam" : "Nữ",
        dob: user.birthday || "",
        email: user.email,
        phone: user.phoneNumber,
        address: user.address,
      });
      fetchUserMembers(user.id);
      setPassengerCount(1);
      setPassengers([
        {
          id: null,
          fullName: "",
          gender: "",
          dob: "",
          email: "",
          phone: "",
          isContact: true, // Mặc định hành khách đầu tiên là người liên hệ
        },
      ]);
      setContactIndex(0); // Đặt contactIndex về 0
    } else {
      setCustomerInfo({
        id: null,
        fullName: "",
        gender: "",
        dob: "",
        email: "",
        phone: "",
        address: "",
      });
      setPassengerCount(1);
      setPassengers([
        {
          id: null,
          fullName: "",
          gender: "",
          dob: "",
          email: "",
          phone: "",
          isContact: true,
        },
      ]);
      setContactIndex(0);
    }
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const newPassengers = [...prev];
      newPassengers[index] = { ...newPassengers[index], [field]: value };
      return newPassengers;
    });
  };

  const handlePassengerSelect = (index, userMember) => {
    setPassengers((prev) => {
      const newPassengers = [...prev];
      newPassengers[index] = {
        id: userMember ? userMember.id : null,
        fullName: userMember ? userMember.fullname : "",
        gender: userMember ? (userMember.sex ? "Nam" : "Nữ") : "",
        dob: userMember ? userMember.birthday : "",
        email: userMember ? userMember.email : "",
        phone: userMember ? userMember.phoneNumber : "",
        isContact: prev[index].isContact,
      };
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
    const maxPassengers = userMembers[customerInfo.id]?.length || 0;
    let count = Math.max(1, parseInt(value) || 1);
    if (customerInfo.id && count > maxPassengers) {
      count = maxPassengers;
      toast.warn(`Số lượng hành khách không được vượt quá ${maxPassengers}!`, { autoClose: 5000 });
    }
    setPassengerCount(count);
    setPassengers((prev) => {
      const newPassengers = Array(count)
        .fill()
        .map((_, i) =>
          prev[i] || {
            id: null,
            fullName: "",
            gender: "",
            dob: "",
            email: "",
            phone: "",
            isContact: i === 0, // Hành khách đầu tiên luôn là người liên hệ
          }
        );
      if (contactIndex >= count) {
        setContactIndex(0);
        return newPassengers.map((p, i) => ({ ...p, isContact: i === 0 }));
      }
      return newPassengers;
    });
  };

  const handleCancel = () => {
    setCustomerInfo({
      id: null,
      fullName: "",
      gender: "",
      dob: "",
      email: "",
      phone: "",
      address: "",
    });
    setPassengerCount(1);
    setPassengers([
      {
        id: null,
        fullName: "",
        gender: "",
        dob: "",
        email: "",
        phone: "",
        isContact: true,
      },
    ]);
    setContactIndex(0);
    setPaymentMethod("Tiền mặt");
    onClose();
  };

  const handleConfirm = () => {
    if (!customerInfo.id) {
      toast.error("Vui lòng chọn khách hàng!", { autoClose: 5000 });
      return;
    }
    if (passengers.some((p) => !p.id)) {
      toast.error("Vui lòng chọn đầy đủ hành khách!", { autoClose: 5000 });
      return;
    }
    if (contactIndex === -1) {
      toast.error("Vui lòng chọn người liên hệ!", { autoClose: 5000 });
      return;
    }

    const bookingRequest = {
      invoiceDTO: {
        totalAmount: totalPrice,
        paymentMethod: paymentMethod.toLowerCase() === "tiền mặt" ? "cash" : "transfer",
        paymentStatus: false,
      },
      tourBookingDTO: {
        tourId: id,
        userId: customerInfo.id,
        seatsBooked: passengerCount,
        totalPrice: totalPrice,
      },
      tourBookingDetailDTO: {
        userMemberId: passengers[contactIndex].id,
        isContact: true,
      },
    };

    fetchPost(
      "/api/admin/tour/create-booking-transaction",
      bookingRequest,
      (res) => {
        toast.success("Tạo giao dịch đặt tour thành công!", { autoClose: 5000 });
        const newBooking = {
          fullName: customerInfo.fullName,
          gender: customerInfo.gender,
          phone: customerInfo.phone,
          email: customerInfo.email,
          booker: passengers.find((p) => p.isContact)?.fullName || customerInfo.fullName,
          userId: customerInfo.id,
          userMemberId: passengers[contactIndex].id,
          seatsBooked: passengerCount,
          totalPrice: totalPrice,
          paymentMethod: paymentMethod.toLowerCase() === "tiền mặt" ? "cash" : "transfer",
        };
        onSave(newBooking);
        handleCancel();
      },
      (err) => {
        console.error("Lỗi tạo giao dịch đặt tour:", err);
        toast.error(`${err.data?.message || "Không thể tạo giao dịch!"}`, { autoClose: 5000 });
      }
    );
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
              <Autocomplete
                options={users}
                getOptionLabel={(option) => option.fullname || ""}
                onChange={(event, value) => handleCustomerSelect(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Họ và tên" fullWidth sx={{minWidth:250}}/>
                )}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Giới tính"
                fullWidth
                value={customerInfo.gender}
                onChange={(e) => handleCustomerChange("gender", e.target.value)}
                disabled
                sx={{maxWidth:100}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ngày sinh"
                fullWidth
                value={customerInfo.dob}
                onChange={(e) => handleCustomerChange("dob", e.target.value)}
                disabled
                sx={{maxWidth:150}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                fullWidth
                value={customerInfo.email}
                onChange={(e) => handleCustomerChange("email", e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Số điện thoại"
                fullWidth
                value={customerInfo.phone}
                onChange={(e) => handleCustomerChange("phone", e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Địa chỉ"
                fullWidth
                value={customerInfo.address}
                onChange={(e) => handleCustomerChange("address", e.target.value)}
                disabled
                sx={{minWidth:400}}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Box 2: Thông tin hành khách */}
        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Thông tin hành khách
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={3}>
              <TextField
                label="Số lượng hành khách"
                type="number"
                fullWidth
                value={passengerCount}
                onChange={(e) => handlePassengerCountChange(e.target.value)}
                disabled={!isEditing || !customerInfo.id}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Tổng tiền"
                fullWidth
                value={totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                disabled
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Phương thức thanh toán"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={!isEditing}
                >
                  <MenuItem value="Tiền mặt">Tiền mặt</MenuItem>
                  <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
                </Select>
              </FormControl>
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
                  Thông tin hành tin khách {index + 1}
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
                  <Autocomplete
                    options={userMembers[customerInfo.id] || []}
                    getOptionLabel={(option) => option.fullname || ""}
                    onChange={(event, value) => handlePassengerSelect(index, value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Họ và tên" fullWidth sx={{minWidth:250}}/>
                    )}
                    disabled={!isEditing || !customerInfo.id}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Giới tính"
                    fullWidth
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                    disabled
                    sx={{maxWidth:100}}
                  />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                      label="Ngày sinh"
                      fullWidth
                      value={passenger.dob}
                      onChange={(e) => handlePassengerChange(index, "dob", e.target.value)}
                      disabled
                       sx={{maxWidth:150}}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Email"
                      fullWidth
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, "email", e.target.value)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Số điện thoại"
                      fullWidth
                      value={passenger.phone}
                      onChange={(e) => handlePassengerChange(index, "phone", e.target.value)}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>

          {isEditing && (
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button variant="outlined" onClick={handleCancel}>
                Hủy
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