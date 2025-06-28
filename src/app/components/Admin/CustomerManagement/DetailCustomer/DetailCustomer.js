import React, { useEffect, useState , useContext} from "react";
import "./DetailCustomer.css";
import { AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
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
      const navigate = useNavigate();
    
      useEffect(() => {
        setTitle("Chi tiết khách hàng");
        setSubtitle("Thông tin chi tiết khách hàng");
      }, [setTitle, setSubtitle]);

  const [customer, setCustomer] = useState(null);
  const [members, setMembers] = useState([]);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDetailMember, setShowDetailMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites] = useState([]); // Chưa có API
  const [cart] = useState([]);      // Chưa có API

  // Lấy thông tin khách hàng, thành viên, lịch sử đặt tour
  const fetchAll = () => {
    fetchGet(`/api/admin/user/get/${customerId}`, (res) => {
      setCustomer(res.data);
    });
    fetchGet(`/api/admin/user-member/user/${customerId}`, (res) => {
      setMembers(res.data || []);
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
    fetchAll();
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
      <div className="cus-detail-popup" style={{ position: "static", boxShadow: "none", margin: "24px auto" }}>
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
                        ? customer.avatar
                        : BE_ENDPOINT + customer.avatar
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
                  <div><b>Trạng thái:</b> {customer?.isLock ? "Đã khóa" : "Hoạt động"}</div>
                </div>
              </div>
            </div>
            <div className="cus-detail-section">
              <div className="cus-detail-title-row">
                <span>Thành viên</span>
                <button
                  className="cus-detail-add-btn"
                  onClick={() => setShowAddMember(true)}
                >
                  <AiOutlinePlus /> Thêm thành viên
                </button>
              </div>
              <table className="cus-detail-table">
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
                        <td>{m.fullname}</td>
                        <td>{m.phoneNumber}</td>
                        <td>{m.email}</td>
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
          <div className="cus-detail-right">
            <div className="cus-detail-section">
              <div className="cus-detail-title">Tuyến đi yêu thích</div>
              <table className="cus-detail-table">
                <thead>
                  <tr>
                    <th>Mã chuyến du lịch</th>
                    <th>Tên tuyến</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="cus-detail-section">
              <div className="cus-detail-title">Giỏ hàng</div>
              <table className="cus-detail-table">
                <thead>
                  <tr>
                    <th>Mã chuyến du lịch</th>
                    <th>Tên tuyến</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="cus-detail-section" style={{ marginTop: 18 }}>
          <div className="cus-detail-title">Lịch sử đặt tour</div>
          <table className="cus-detail-table">
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
                    <td>{o.tourCode}</td>
                    <td>{o.tourName}</td>
                    <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ""}</td>
                    <td>{o.quantity}</td>
                    <td>{o.totalAmount?.toLocaleString("vi-VN")}₫</td>
                    <td>{o.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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