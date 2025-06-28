import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTitleContext } from "../../../layouts/adminLayout/AdminLayout/AdminLayout";
import "./CustomerMainPage.css";
import search from "../../../assets/icons/customer/header/search.png";
import { MdOutlineAddBox } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import AddCustomer from "../../../components/Admin/CustomerManagement/AddCustomer/AddCustomer";
import { BE_ENDPOINT, fetchGet, fetchDelete } from "../../../lib/httpHandler";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function CustomerMainPage() {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("Tất cả khách hàng");
    setSubtitle("Thông tin tất cả khách hàng");
  }, [setTitle, setSubtitle]);

  const [showAdd, setShowAdd] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  // Fetch all customers
  useEffect(() => {
    fetchGet(
      "/api/admin/customer/get-all",
      (res) => setCustomers(res.data || []),
      () => setCustomers([]),
      () => setCustomers([])
    );
  }, []);

  // Fetch all accounts to get lock status
  useEffect(() => {
    fetchGet(
      "/api/admin/account/get-all",
      (res) => setAccounts(res.data || []),
      () => setAccounts([]),
      () => setAccounts([])
    );
  }, []);

  // Search filter
  const filteredCustomers = customers
    .filter(
      (c) =>
        c.fullname?.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.phoneNumber?.includes(searchValue)
    );

  // Get account status for customer
  const getAccountStatus = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !customer.account_id) return "Không có tài khoản";
    
    const account = accounts.find(acc => acc.id === customer.account_id);
    if (!account) return "Không xác định";
    
    return account.isLock ? "Đã khóa" : "Đang mở";
  };

  const handleShowAdd = () => setShowAdd(!showAdd);

  const handleShowDetail = (customer) => {
    navigate(`/admin/customers/${customer.id}`);
  };

  const MySwal = withReactContent(Swal);

  const handleDelete = (id) => {
    // Kiểm tra xem khách hàng có tour booking nào không
    fetchGet(
      `/api/admin/tour-booking/history/${id}`,
      (res) => {
        const bookings = res.data || [];
        if (bookings.length > 0) {
          MySwal.fire({
            icon: "warning",
            title: "Không thể xóa khách hàng",
            text: "Khách hàng này có lịch sử đặt tour. Không thể xóa!",
            confirmButtonText: "Đóng",
            confirmButtonColor: "#3085d6",
          });
          return;
        }

        // Nếu không có booking, tiếp tục xác nhận xóa
        MySwal.fire({
          icon: "warning",
          title: "Xác nhận xóa",
          text: "Bạn có chắc muốn xóa khách hàng này? Tất cả thành viên và tài khoản liên quan cũng sẽ bị xóa!",
          showCancelButton: true,
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
          confirmButtonColor: "#c34141",
          cancelButtonColor: "#aaa",
        }).then((result) => {
          if (!result.isConfirmed) return;

          // Tiến hành xóa
          performDelete(id);
        });
      },
      () => {
        MySwal.fire("Lỗi", "Không thể kiểm tra lịch sử đặt tour!", "error");
      },
      () => {
        MySwal.fire("Lỗi", "Không thể kiểm tra lịch sử đặt tour!", "error");
      }
    );
  };

  const performDelete = (id) => {
    // 1. Lấy danh sách user member của khách hàng
    fetchGet(
      `/api/admin/user-member/user/${id}`,
      (res) => {
        const members = res.data || [];
        console.log("User members to delete:", members);
        
        // 2. Xóa từng user member
        Promise.all(
          members.map((m) =>
            new Promise((resolve) => {
              fetchDelete(
                `/api/admin/user-member/delete/${m.id}`, 
                () => {
                  console.log(`Deleted user member ${m.id}`);
                  resolve();
                }, 
                (error) => {
                  console.error(`Failed to delete user member ${m.id}:`, error);
                  resolve(); // Vẫn resolve để không block
                }, 
                (exception) => {
                  console.error(`Exception deleting user member ${m.id}:`, exception);
                  resolve(); // Vẫn resolve để không block
                }
              );
            })
          )
        ).then(() => {
          // 3. Lấy accountId của khách hàng
          fetchGet(
            `/api/admin/customer/get/${id}`,
            (res2) => {
              console.log("Customer data:", res2.data);
              const accountId = res2.data?.account_id;
              
              if (accountId) {
                console.log("Deleting account:", accountId);
                // 4. Xóa account (sẽ tự động xóa customer theo cascade)
                fetchDelete(
                  `/api/admin/account/delete/${accountId}`,
                  () => {
                    console.log("Account deleted successfully (customer also deleted by cascade)");
                    // Cập nhật danh sách trên FE
                    setCustomers((prev) => {
                      const newList = prev.filter((c) => c.id !== id);
                      console.log("Updated customer list:", newList);
                      return newList;
                    });
                    MySwal.fire({
                      icon: "success",
                      title: "Đã xóa khách hàng!",
                      timer: 1200,
                      showConfirmButton: false,
                    });
                  },
                  (error) => {
                    console.error("Error deleting account:", error);
                    MySwal.fire("Lỗi", "Xóa account thất bại!", "error");
                  },
                  (exception) => {
                    console.error("Exception deleting account:", exception);
                    MySwal.fire("Lỗi", "Lỗi kết nối khi xóa account!", "error");
                  }
                );
              } else {
                console.log("No account to delete, proceeding to delete customer");
                // Nếu không có account, chỉ xóa customer
                deleteCustomerFinal(id);
              }
            },
            (error) => {
              console.error("Error getting customer info:", error);
              MySwal.fire("Lỗi", "Không lấy được thông tin khách hàng!", "error");
            },
            (exception) => {
              console.error("Exception getting customer info:", exception);
              MySwal.fire("Lỗi", "Lỗi kết nối khi lấy thông tin khách hàng!", "error");
            }
          );
        });
      },
      (error) => {
        console.error("Error getting user members:", error);
        MySwal.fire("Lỗi", "Không lấy được danh sách thành viên!", "error");
      },
      (exception) => {
        console.error("Exception getting user members:", exception);
        MySwal.fire("Lỗi", "Lỗi kết nối khi lấy danh sách thành viên!", "error");
      }
    );
  };

  // Hàm riêng để xóa customer cuối cùng
  const deleteCustomerFinal = (id) => {
    console.log("Deleting customer:", id);
    fetchDelete(
      `/api/admin/customer/delete/${id}`,
      () => {
        console.log("Customer deleted successfully");
        // Cập nhật danh sách trên FE
        setCustomers((prev) => {
          const newList = prev.filter((c) => c.id !== id);
          console.log("Updated customer list:", newList);
          return newList;
        });
        MySwal.fire({
          icon: "success",
          title: "Đã xóa khách hàng!",
          timer: 1200,
          showConfirmButton: false,
        });
      },
      (error) => {
        console.error("Error deleting customer:", error);
        MySwal.fire("Lỗi", "Xóa khách hàng thất bại!", "error");
      },
      (exception) => {
        console.error("Exception deleting customer:", exception);
        MySwal.fire("Lỗi", "Lỗi kết nối khi xóa khách hàng!", "error");
      }
    );
  };

  return (
    <div className="customer-container">
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
          title="Thêm khách hàng mới"
          onClick={handleShowAdd}
        >
          <MdOutlineAddBox className="add-icon" />
          Thêm khách hàng
        </button>
      </div>

      <table className="customer-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Trạng thái</th>
            <th>Xem</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>
                Không có khách hàng nào.
              </td>
            </tr>
          ) : (
            filteredCustomers.map((cus, idx) => (
              <tr key={cus.id}>
                <td>
                  <img
                    src={cus.avatar?.startsWith("http") ? cus.avatar : BE_ENDPOINT + cus.avatar}
                    alt="avatar"
                    style={{ width: 36, height: 36, borderRadius: "50%" }}
                  />
                </td>
                <td>{cus.fullname}</td>
                <td>{cus.email}</td>
                <td>{cus.phoneNumber}</td>
                <td>{cus.birthday}</td>
                <td>{cus.sex ? "Nam" : "Nữ"}</td>
                <td>
                  <span 
                    style={{
                      color: getAccountStatus(cus.id) === "Đã khóa" ? "#dc3545" : "#28a745",
                      fontWeight: "600"
                    }}
                  >
                    {getAccountStatus(cus.id)}
                  </span>
                </td>
                <td>
                  <MdOutlineRemoveRedEye
                    className="view-button"
                    title="Xem chi tiết"
                    onClick={() => handleShowDetail(cus)}
                  />
                </td>
                <td>
                  <GoTrash
                    className="delete-button"
                    title="Xóa"
                    onClick={() => handleDelete(cus.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Popup thêm khách hàng */}
      {showAdd && (
        <AddCustomer
          onCloseAddForm={handleShowAdd}
          onAdded={(newCus) => {
            setCustomers((prev) => [...prev, newCus]);
            // Cập nhật lại danh sách accounts để hiển thị đúng trạng thái
            fetchGet(
              "/api/admin/account/get-all",
              (res) => setAccounts(res.data || []),
              () => {},
              () => {}
            );
          }}
        />
      )}
    </div>
  );
}