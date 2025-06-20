import React, { useEffect, useState } from "react";
import "./TourRouteMainPage.css";
import search from "../../../assets/icons/customer/header/search.png";
import { MdOutlineAddBox } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { BE_ENDPOINT, fetchGet, fetchDelete } from "../../../lib/httpHandler";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import AddTourRoute from "../../../components/Admin/TourRouteManagement/AddTourRoute/AddTourRoute";

export default function TourRouteMainPage() {
  const [tourRoutes, setTourRoutes] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGet(
      "/api/admin/tour-route/get-all",
      (res) => {
        console.log("Dữ liệu tour routes:", res.data);
        // Ánh xạ dữ liệu API
        const mappedTourRoutes = res.data.map((tr) => ({
          id: tr.id,
          name: tr.routeName, // Đổi routeName thành name
          image: tr.image,
          departure: tr.startLocation, // Đổi startLocation thành departure
          status: "Hoạt động", // Giả định trạng thái, thay đổi nếu API cung cấp
          duration: calculateDuration(tr.startDate, tr.endDate), // Tính thời gian
          price: "Liên hệ", // Giả định giá, thay đổi nếu API cung cấp
        }));
        setTourRoutes(mappedTourRoutes || []);
      },
      (err) => {
        console.error("Lỗi lấy tour routes:", err);
        setTourRoutes([]);
      },
      () => console.log("Hoàn tất lấy tour routes.")
    );
  }, []);

  // Hàm tính thời gian (duration)
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${diffDays} ngày`;
  };

  // Search filter
  const filteredTourRoutes = tourRoutes.filter((tr) =>
    tr.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleShowAdd = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleShowDetail = (tourRoute) => {
    navigate(`/admin/tour-route/get/${tourRoute.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tuyến du lịch này?")) {
      fetchDelete(
        `/api/admin/tour-route/delete/${id}`,
        null,
        () => setTourRoutes((prev) => prev.filter((tr) => tr.id !== id)),
        () => alert("Xóa thất bại!"),
        () => alert("Có lỗi xảy ra!")
      );
    }
  };

  const columns = [
    {
      field: "image",
      headerName: "Tuyến",
      width: 150,
      renderCell: (params) => (
        <img
          src={
            params.row.image?.startsWith("http")
              ? params.row.image
              : BE_ENDPOINT + params.row.image
          }
          alt="tourroute"
          style={{ width: 36, height: 36, borderRadius: "50%" }}
        />
      ),
      headerAlign: "center",
    },
    { field: "name", headerName: "Tên tuyến du lịch", width: 350, headerAlign: "center" },
    { field: "status", headerName: "Tình trạng", width: 120, headerAlign: "center" },
    { field: "departure", headerName: "Khởi hành", width: 150, headerAlign: "center" },
    { field: "duration", headerName: "Thời gian", width: 120, headerAlign: "center" },
    { field: "price", headerName: "Giá tuyến", width: 120, headerAlign: "center" },
    {
      field: "view",
      headerName: "Xem",
      width: 80,
      renderCell: (params) => (
        <MdOutlineRemoveRedEye
          className="view-button"
          title="Xem chi tiết"
          onClick={() => handleShowDetail(params.row)}
        />
      ),
      headerAlign: "center",
    },
    {
      field: "delete",
      headerName: "Xóa",
      width: 80,
      renderCell: (params) => (
        <GoTrash
          className="delete-button"
          title="Xóa"
          onClick={() => handleDelete(params.row.id)}
        />
      ),
      headerAlign: "center",
    },
  ];

  return (
    <div className="tourroute-container">
      <div className="top-bar">
        <div className="search-box">
          <img src={search} alt="Icon-Search" className="icon-search" />
          <input
            type="text"
            className="input-search"
            placeholder="Tìm kiếm ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <button
          className="add-button"
          title="Thêm tuyến du lịch mới"
          onClick={handleShowAdd}
        >
          <MdOutlineAddBox className="add-icon" />
          Thêm tuyến du lịch
        </button>
      </div>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredTourRoutes}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              color: "#c34141",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnHeader": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              textAlign: "center",
            },
            "& .MuiDataGrid-cell": {
              textAlign: "center",
            },
          }}
        />
      </Box>

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Thêm tuyến du lịch mới</DialogTitle>
        <DialogContent>
          <AddTourRoute onClose={handleCloseAddDialog} setTourRoutes={setTourRoutes} />
        </DialogContent>
      </Dialog>
    </div>
  );
}