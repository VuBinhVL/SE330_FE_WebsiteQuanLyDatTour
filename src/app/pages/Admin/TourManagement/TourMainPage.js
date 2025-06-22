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
import AddTour from "../../../components/Admin/TourManagement/AddTour/AddTour";
import { toast } from "react-toastify";

export default function TourMainPage() {
  const [tours, setTours] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGet(
      "/api/admin/tour/get-all",
      async (res) => {
        console.log("Danh sách tour:", res);
        try {
          const tourRouteIds = [...new Set(res.data.map((tour) => tour.tourRouteId))];
          const tourRoutePromises = tourRouteIds.map((id) =>
            new Promise((resolve, reject) => {
              fetchGet(
                `/api/admin/tour-route/get/${id}`,
                (routeRes) => {
                  console.log("Dữ liệu tuyến:", routeRes);
                  resolve({
                    id: routeRes.data?.id || id,
                    name: routeRes.data?.routeName || `Tuyến du lịch ${id}`,
                  });
                },
                (error) => {
                  console.error(`Lỗi tour route ${id}:`, error);
                  resolve({ id, name: `Tuyến du lịch ${id}` });
                },
                () => console.log(`Hoàn tất tour route ${id}`)
              );
            })
          );
          const tourRoutes = await Promise.all(tourRoutePromises);
          console.log("tourRoutes:", tourRoutes);

          const tourRouteMap = tourRoutes.reduce((acc, route) => {
            if (route && route.id) {
              acc[route.id] = route.name;
              console.log("map:", route.name);
            }
            return acc;
          }, {});
          console.log("tourRouteMap:", tourRouteMap);

          const mappedTours = res.data.map((tour) => ({
            id: tour.id,
            name: tourRouteMap[tour.tourRouteId] || `Chuyến du lịch ${tour.id}`,
            startDate: new Date(tour.depatureDate).toLocaleDateString("vi-VN"),
            departure: tour.pickUpLocation,
            status:
              tour.status === 0
                ? "Hoạt động"
                : tour.status === 1
                ? "Đã hủy"
                : tour.status === 2
                ? "Hết vé"
                : tour.status === 3
                ? "Hoàn thành"
                : "Không xác định",
            price: tour.price.toLocaleString("vi-VN") + " VND",
            quantity: tour.totalSeats,
          }));

          setTours(mappedTours || []);
        } catch (error) {
          console.error("Lỗi xử lý tuyến:", error);
          const mappedTours = res.data.map((tour) => ({
            id: tour.id,
            name: `Chuyến du lịch ${tour.id}`,
            startDate: new Date(tour.depatureDate).toLocaleDateString("vi-VN"),
            departure: tour.pickUpLocation,
            status:
              tour.status === 0
                ? "Hoạt động"
                : tour.status === 1
                ? "Đã hủy"
                : tour.status === 2
                ? "Hết vé"
                : tour.status === 3
                ? "Hoàn thành"
                : "Không xác định",
            price: tour.price.toLocaleString("vi-VN") + " VND",
            quantity: tour.totalSeats - tour.bookedSeats,
          }));
          setTours(mappedTours || []);
        }
      },
      (err) => {
        console.error("Lỗi lấy tour:", err);
        setTours([]);
      },
      () => console.log("Hoàn tất lấy tour.")
    );
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
    navigate(`/admin/tour/get/${tour.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa chuyến đi này?")) {
      fetchDelete(
        `/api/admin/tour/delete/${id}`,
        null,
        () => {
          setTours((prev) => prev.filter((tour) => tour.id !== id));
          toast.success("Xóa chuyến du lịch thành công!", { autoClose: 3000 });
        },
        (err) => {
          console.log("Lỗi khi xóa chuyến du lịch:", err);
          toast.error(err.data?.message || "Xóa thất bại!", {
            autoClose: 5000,
          });
        },
        () => {
          toast.error("Đã xảy ra lỗi mạng khi xóa chuyến du lịch!", {
            autoClose: 5000,
          });
        }
      );
    }
  };

  const columns = [
    { field: "name", headerName: "Tên tuyến du lịch", width: 300, headerAlign: "center" },
    { field: "startDate", headerName: "Ngày khởi hành", width: 150, headerAlign: "center" },
    { field: "departure", headerName: "Điểm xuất phát", width: 230, headerAlign: "center" },
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
        <DialogTitle>Thêm chuyến du lịch</DialogTitle>
        <DialogContent>
          <AddTour onClose={handleCloseAddDialog} setTours={setTours} />
        </DialogContent>
      </Dialog>
    </div>
  );
}