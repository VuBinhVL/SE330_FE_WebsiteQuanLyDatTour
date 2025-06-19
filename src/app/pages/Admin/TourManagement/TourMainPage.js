import React, { useEffect, useState } from "react";
import "./TourMainPage.css";
import search from "../../../assets/icons/customer/header/search.png";
import { MdOutlineAddBox } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { BE_ENDPOINT, fetchGet, fetchDelete } from "../../../lib/httpHandler";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";

export default function TourMainPage() {
  const [tours, setTours] = useState([
    {
      id: 1,
      name: "Thái Lan: Bangkok - Pattaya",
      status: "Hoạt động",
      departure: "Đà Nẵng",
      startDate: "01/01/2026",
      price: "5,000,000 VND",
      quantity: 30,
    },
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // fetchGet(
    //   "/api/admin/tour/get-all",
    //   (res) => setTours(res.data || []),
    //   () => setTours([]),
    //   () => setTours([])
    // );
  }, []);

  const filteredTours = tours.filter((tour) =>
    tour.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleShowAdd = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleShowDetail = (tour) => {
    navigate(`/admin/tour/detail/${tour.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa chuyến đi này?")) {
      fetchDelete(
        `/api/admin/tour/delete/${id}`,
        null,
        () => setTours((prev) => prev.filter((tour) => tour.id !== id)),
        () => alert("Xóa thất bại!"),
        () => alert("Có lỗi xảy ra!")
      );
    }
  };

  const columns = [
    { field: "name", headerName: "Tên tuyến du lịch", width: 380, headerAlign: "center" },
    { field: "startDate", headerName: "Ngày khởi hành", width: 150, headerAlign: "center" },
    { field: "departure", headerName: "Điểm xuất phát", width: 150, headerAlign: "center" },
    { field: "status", headerName: "Trạng thái", width: 120, headerAlign: "center" },
    { field: "price", headerName: "Giá tuyến", width: 120, headerAlign: "center" },
    { field: "quantity", headerName: "Số lượng", width: 100, headerAlign: "center" },
    {
      field: "view",
      headerName: "View",
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
      headerName: "Delete",
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
    <div className="tour-container">
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
          title="Thêm chuyến đi mới"
          onClick={handleShowAdd}
        >
          <MdOutlineAddBox className="add-icon" />
          Thêm chuyến đi
        </button>
      </div>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredTours}
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
        <DialogTitle>Thêm chuyến đi mới</DialogTitle>
        <DialogContent>
          {/* <AddTour onClose={handleCloseAddDialog} setTours={setTours} /> */}
        </DialogContent>
      </Dialog>
    </div>
  );
}