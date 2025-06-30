import React, { useEffect, useState, useContext } from "react";
import "./DetailCustomer.css";
import { AiOutlinePlus } from "react-icons/ai";
import { AdminTitleContext } from "../../../../layouts/adminLayout/AdminLayout/AdminLayout";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import defaultAvatar from "../../../../assets/images/customer/default-avatar.png";
import { BE_ENDPOINT, fetchGet, fetchDelete } from "../../../../lib/httpHandler";
import EditCustomer from "../EditCustomer/EditCustomer";
import AddUserMember from "../../UserMemberManagement/AddUserMember/AddUserMember";
import DetailUserMember from "../../UserMemberManagement/DetailUserMember/DetailUserMember";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function DetailCustomer({ customerId }) {

      const { setTitle, setSubtitle } = useContext(AdminTitleContext);
    
      useEffect(() => {
        setTitle("Chi tiết khách hàng");
        setSubtitle("Thông tin chi tiết khách hàng");
      }, [setTitle, setSubtitle]);

  const [customer, setCustomer] = useState(null);
  const [account, setAccount] = useState(null);
  const [members, setMembers] = useState([]);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDetailMember, setShowDetailMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cartWithTourInfo, setCartWithTourInfo] = useState([]);

  // Lấy thông tin khách hàng, thành viên, lịch sử đặt tour, tài khoản, yêu thích, giỏ hàng
  const fetchAll = () => {
    fetchGet(`/api/admin/user/get/${customerId}`, (res) => {
      setCustomer(res.data);
      
      // Fetch account info after getting user data
      if (res.data && res.data.account_id) {
        fetchGet(`/api/admin/account/get/${res.data.account_id}`, (accountRes) => {
          setAccount(accountRes.data);
        }, (error) => {
          console.error("Error fetching account data:", error);
        });
      }
    }, (error) => {
      console.error("Error fetching customer data:", error);
    });
    
    fetchGet(`/api/admin/user-member/user/${customerId}`, (res) => {
      setMembers(res.data || []);
    }, (error) => {
      console.error("Error fetching members:", error);
    });
    
    fetchGet(`/api/admin/tour-booking/history/${customerId}`, (res) => {
      setOrders(
        (res.data || []).map((o) => ({
          ...o,
          tourCode: o.tourId,
          tourName: o.tourRouteName,
          orderDate: o.createdAt,
          quantity: o.seatsBooked,
          totalAmount: o.totalPrice,
          paymentStatus: o.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán",
        }))
      );
    }, (error) => {
      console.error("Error fetching booking history:", error);
    });
    
    // Fetch favorite tours
    fetchGet(`/api/admin/favorite-tour/user/${customerId}/response`, (res) => {
      setFavorites(res.data || []);
    }, (error) => {
      console.error("Error fetching favorite tours:", error);
      setFavorites([]); // Set empty array on error
    });
    
    // Fetch cart items
    fetchGet(`/api/admin/cart/user/${customerId}/items`, (res) => {
      const cartItems = res.data || [];
      
      // Fetch tour information for each cart item
      if (cartItems.length > 0) {
        const cartWithTours = [];
        let fetchedCount = 0;
        
        cartItems.forEach((item, index) => {
          if (item.tourID) {
            // First fetch tour info
            fetchGet(`/api/admin/tour/get/${item.tourID}`, (tourRes) => {
              const tourData = tourRes.data;
              
              // Then fetch tour route info to get route name
              if (tourData && tourData.tourRouteId) {
                fetchGet(`/api/admin/tour-route/get/${tourData.tourRouteId}`, (routeRes) => {
                  cartWithTours[index] = {
                    ...item,
                    tourInfo: tourData,
                    tourRouteName: routeRes.data?.routeName || "N/A"
                  };
                  fetchedCount++;
                  
                  if (fetchedCount === cartItems.length) {
                    setCartWithTourInfo([...cartWithTours]);
                  }
                }, (error) => {
                  console.error(`Error fetching tour route ${tourData.tourRouteId}:`, error);
                  cartWithTours[index] = {
                    ...item,
                    tourInfo: tourData,
                    tourRouteName: "N/A"
                  };
                  fetchedCount++;
                  
                  if (fetchedCount === cartItems.length) {
                    setCartWithTourInfo([...cartWithTours]);
                  }
                });
              } else {
                cartWithTours[index] = {
                  ...item,
                  tourInfo: tourData,
                  tourRouteName: "N/A"
                };
                fetchedCount++;
                
                if (fetchedCount === cartItems.length) {
                  setCartWithTourInfo([...cartWithTours]);
                }
              }
            }, (error) => {
              console.error(`Error fetching tour ${item.tourID}:`, error);
              cartWithTours[index] = {
                ...item,
                tourInfo: null,
                tourRouteName: "N/A"
              };
              fetchedCount++;
              
              if (fetchedCount === cartItems.length) {
                setCartWithTourInfo([...cartWithTours]);
              }
            });
          } else {
            cartWithTours[index] = {
              ...item,
              tourInfo: null,
              tourRouteName: "N/A"
            };
            fetchedCount++;
            
            if (fetchedCount === cartItems.length) {
              setCartWithTourInfo([...cartWithTours]);
            }
          }
        });
      } else {
        setCartWithTourInfo([]);
      }
    }, (error) => {
      console.error("Error fetching cart items:", error);
      setCartWithTourInfo([]); // Set empty array on error
    });
  };

  useEffect(() => {
    if (!customerId) return;
    fetchAll();
    // eslint-disable-next-line
  }, [customerId]);

  // Xử lý cập nhật sau khi đóng popup
  const handleUpdatedCustomer = (updated) => {
    setCustomer(updated);
    setImageRefreshKey(Date.now()); // Force image refresh
    // Force re-render by updating state
    setTimeout(() => {
      fetchAll();
    }, 100);
  };
  const handleAddedMember = () => {
    fetchAll();
  };
  const handleUpdatedMember = () => {
    fetchAll();
  };

  const handleDeleteMember = (memberId) => {
    MySwal.fire({
      icon: "warning",
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa thành viên này?",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#c34141",
      cancelButtonColor: "#aaa",
    }).then((result) => {
      if (result.isConfirmed) {
        fetchDelete(
          `/api/admin/user-member/delete/${memberId}`,
          () => {
            MySwal.fire({
              icon: "success",
              title: "Đã xóa thành viên!",
              timer: 1200,
              showConfirmButton: false,
            });
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
          },
          () => {
            MySwal.fire({
              icon: "error",
              title: "Xóa thất bại!",
            });
          }
        );
      }
    });
  };

  return (
    <div className="cus-detail-page">
      <div className="cus-detail-popup" style={{ position: "static", boxShadow: "none", margin: "16px auto" }}>
        <div className="cus-detail-content">
          <div className="cus-detail-left">
            <div className="cus-detail-section">
              <div className="cus-detail-title-row">
                <span>Thông tin cá nhân</span>
                <button
                  className="cus-detail-edit-btn"
                  title="Chỉnh sửa thông tin"
                  onClick={() => setShowEditCustomer(true)}
                >
                  <PiPencilSimpleLineBold />
                </button>
              </div>
              <div className="cus-detail-info">
                <img
                  src={
                    customer?.avatar
                      ? customer.avatar.startsWith("http")
                        ? `${customer.avatar}?t=${imageRefreshKey}`
                        : `${BE_ENDPOINT}${customer.avatar}?t=${imageRefreshKey}`
                      : defaultAvatar
                  }
                  alt="avatar"
                  className="cus-detail-avatar"
                />
                <div className="cus-detail-info-fields">
                  <div><b>Họ và tên:</b> {customer?.fullname || ""}</div>
                  <div><b>Giới tính:</b> {customer?.sex === true ? "Nam" : customer?.sex === false ? "Nữ" : ""}</div>
                  <div><b>Ngày sinh:</b> {customer?.birthday ? new Date(customer.birthday).toLocaleDateString() : ""}</div>
                  <div><b>Địa chỉ:</b> {customer?.address || ""}</div>
                  <div><b>Số điện thoại:</b> {customer?.phoneNumber || ""}</div>
                  <div><b>Email:</b> {customer?.email || ""}</div>
                  <div><b>Trạng thái:</b> {account?.isLock ? "Đã khóa" : "Hoạt động"}</div>
                </div>
              </div>
            </div>
            
            <div className="cus-detail-section member-table-section">
              <div className="cus-detail-title-row">
                <span>Thành viên</span>
                <button
                  className="cus-detail-add-btn"
                  onClick={() => setShowAddMember(true)}
                >
                  <AiOutlinePlus /> Thêm thành viên
                </button>
              </div>
              <div className="cus-detail-table-container">
                <table className="cus-detail-table-in-container member-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>Số điện thoại</th>
                      <th>Email</th>
                      <th>Xem</th>
                      <th>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center" }}>Chưa có thành viên</td>
                      </tr>
                    ) : (
                      members.map((m, idx) => (
                        <tr key={m.id || idx}>
                          <td>{idx + 1}</td>
                          <td title={m.fullname}>{m.fullname}</td>
                          <td title={m.phoneNumber}>{m.phoneNumber}</td>
                          <td title={m.email}>{m.email}</td>
                          <td>
                            <MdOutlineRemoveRedEye
                              className="cus-detail-view-member"
                              title="Xem chi tiết"
                              onClick={() => {
                                setSelectedMember(m);
                                setShowDetailMember(true);
                              }}
                            />
                          </td>
                          <td>
                            <GoTrash
                              className="cus-detail-delete-member"
                              title="Xóa thành viên"
                              onClick={() => handleDeleteMember(m.id)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="cus-detail-right">
            <div className="cus-detail-section">
              <div className="cus-detail-title">Tuyến đi yêu thích</div>
              <div className="cus-detail-table-container">
                <table className="cus-detail-table-in-container">
                  <thead>
                    <tr>
                      <th>Mã tuyến du lịch</th>
                      <th>Tên tuyến</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favorites.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                      </tr>
                    ) : (
                      favorites.map((fav, idx) => (
                        <tr key={idx}>
                          <td title={fav.tourRouteId}>{fav.tourRouteId || "N/A"}</td>
                          <td title={fav.tourRouteName}>
                            {fav.tourRouteName || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="cus-detail-section">
              <div className="cus-detail-title">Giỏ hàng</div>
              <div className="cus-detail-table-container">
                <table className="cus-detail-table-in-container">
                  <thead>
                    <tr>
                      <th>Mã chuyến du lịch</th>
                      <th>Tên tuyến</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartWithTourInfo.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                      </tr>
                    ) : (
                      cartWithTourInfo.map((item, idx) => (
                        <tr key={idx}>
                          <td title={item.tourID}>{item.tourID || "N/A"}</td>
                          <td title={item.tourRouteName}>
                            {item.tourRouteName || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="cus-detail-section" style={{ marginTop: 16 }}>
          <div className="cus-detail-title">Lịch sử đặt tour</div>
          <div className="cus-detail-table-container">
            <table className="cus-detail-table-in-container">
              <thead>
                <tr>
                  <th>Mã chuyến du lịch</th>
                  <th>Tên tuyến du lịch</th>
                  <th>Ngày đặt</th>
                  <th>Số lượng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  orders.map((o, idx) => (
                    <tr key={idx}>
                      <td title={o.tourCode}>{o.tourCode}</td>
                      <td title={o.tourName}>{o.tourName}</td>
                      <td title={o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ""}>
                        {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ""}
                      </td>
                      <td title={o.quantity}>{o.quantity}</td>
                      <td title={o.totalAmount?.toLocaleString("vi-VN") + "₫"}>
                        {o.totalAmount?.toLocaleString("vi-VN")}₫
                      </td>
                      <td title={o.paymentStatus}>{o.paymentStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Popup chỉnh sửa khách hàng */}
      {showEditCustomer && customer && (
        <EditCustomer
          customer={customer}
          onCloseEditForm={() => setShowEditCustomer(false)}
          onUpdated={handleUpdatedCustomer}
        />
      )}

      {/* Popup thêm thành viên */}
      {showAddMember && (
        <AddUserMember
          userId={customerId}
          onClose={() => setShowAddMember(false)}
          onAdded={handleAddedMember}
        />
      )}

      {/* Popup xem/sửa thành viên */}
      {showDetailMember && selectedMember && (
        <DetailUserMember
          userMember={selectedMember}
          onClose={() => {
            setShowDetailMember(false);
            setSelectedMember(null);
          }}
          onUpdated={handleUpdatedMember}
        />
      )}
    </div>
  );
}