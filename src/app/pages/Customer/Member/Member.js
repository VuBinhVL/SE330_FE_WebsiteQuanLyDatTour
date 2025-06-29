import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import UserSidebar from "../../../components/Customer/UserSidebar/UserSidebar";
import AddUserMember from "../../../components/Admin/UserMemberManagement/AddUserMember/AddUserMember";
import DetailUserMember from "../../../components/Admin/UserMemberManagement/DetailUserMember/DetailUserMember";
import { fetchGet, fetchDelete } from "../../../lib/httpHandler";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import search from "../../../assets/icons/customer/header/search.png";
import "./Member.css";

const MySwal = withReactContent(Swal);

export default function Member() {
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDetailMember, setShowDetailMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const userId = localStorage.getItem("userId");

  // Fetch members for current user
  const fetchMembers = () => {
    if (!userId) return;
    
    setLoading(true);
    fetchGet(
      `/api/admin/user-member/user/${userId}`,
      (res) => {
        setMembers(res.data || []);
        setLoading(false);
      },
      () => {
        setMembers([]);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAddedMember = () => {
    fetchMembers();
  };

  const handleUpdatedMember = () => {
    fetchMembers();
  };

  const handleDeleteMember = (memberId, memberName) => {
    MySwal.fire({
      icon: "warning",
      title: "Xác nhận xóa",
      text: `Bạn có chắc muốn xóa thành viên "${memberName}"?`,
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#c34141",
      cancelButtonColor: "#aaa",
    }).then((result) => {
      if (result.isConfirmed) {
        fetchDelete(
          `/api/admin/user-member/delete/${memberId}`,
          (response) => {
            console.log("Delete member response:", response);
            MySwal.fire({
              icon: "success",
              title: "Đã xóa thành viên!",
              timer: 1200,
              showConfirmButton: false,
            });
            // Update the local state immediately
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
          },
          (error) => {
            console.error("Delete member error:", error);
            MySwal.fire({
              icon: "error",
              title: "Xóa thất bại!",
              text: error?.data?.message || "Không thể xóa thành viên. Vui lòng thử lại.",
            });
          },
          (exception) => {
            console.error("Delete member exception:", exception);
            MySwal.fire({
              icon: "error",
              title: "Lỗi kết nối!",
              text: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
            });
          }
        );
      }
    });
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowDetailMember(true);
  };

  // Filter members based on search value
  const filteredMembers = members.filter((member) =>
    member.fullname?.toLowerCase().includes(searchValue.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
    member.phoneNumber?.includes(searchValue)
  );

  return (
    <div className="member-container">
      <UserSidebar />
      <main className="member-main">
        <div className="member-header">
          <h2 className="member-title">THÔNG TIN DANH SÁCH THÀNH VIÊN</h2>
        </div>

        <div className="member-content">
          <div className="member-top-bar">
            <div className="member-search-box">
              <img src={search} alt="Icon-Search" className="member-icon-search" />
              <input
                type="text"
                className="member-input-search"
                placeholder="Tìm kiếm thành viên ..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <button 
              className="member-add-btn"
              onClick={() => setShowAddMember(true)}
            >
              <AiOutlinePlus /> Thêm thành viên
            </button>
          </div>

          {loading ? (
            <div className="member-loading">Đang tải...</div>
          ) : members.length === 0 ? (
            <div className="member-empty">
              <div className="empty-icon">👥</div>
              <h3>Chưa có thành viên nào</h3>
              <p>Thêm thành viên để thuận tiện hơn khi đặt tour.</p>
              <button 
                className="empty-add-btn"
                onClick={() => setShowAddMember(true)}
              >
                <AiOutlinePlus /> Thêm thành viên đầu tiên
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="member-empty">
              <div className="empty-icon">🔍</div>
              <h3>Không tìm thấy thành viên</h3>
              <p>Không có thành viên nào phù hợp với từ khóa "{searchValue}".</p>
            </div>
          ) : (
            <div className="member-section">
              <div className="member-table-container">
                <table className="member-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>Số điện thoại</th>
                      <th>Email</th>
                      <th>Ngày sinh</th>
                      <th>Giới tính</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr key={member.id || index}>
                        <td>{index + 1}</td>
                        <td className="member-name">{member.fullname}</td>
                        <td>{member.phoneNumber}</td>
                        <td>{member.email}</td>
                        <td>
                          {member.birthday 
                            ? new Date(member.birthday).toLocaleDateString("vi-VN")
                            : "—"
                          }
                        </td>
                        <td>
                          {member.sex === true 
                            ? "Nam" 
                            : member.sex === false 
                              ? "Nữ" 
                              : "—"
                          }
                        </td>
                        <td className="member-actions">
                          <button
                            className="member-view-btn"
                            title="Xem chi tiết"
                            onClick={() => handleViewMember(member)}
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                          <button
                            className="member-delete-btn"
                            title="Xóa thành viên"
                            onClick={() => handleDeleteMember(member.id, member.fullname)}
                          >
                            <GoTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddMember && (
        <AddUserMember
          userId={userId}
          onClose={() => setShowAddMember(false)}
          onAdded={handleAddedMember}
        />
      )}

      {/* Detail Member Modal */}
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