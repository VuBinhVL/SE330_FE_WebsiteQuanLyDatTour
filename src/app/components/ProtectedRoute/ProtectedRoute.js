import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchGet } from '../../lib/httpHandler';

const ProtectedRoute = ({ children, requireAdmin = false, requireStaffOrAdmin = false, redirectLoggedIn = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      if (redirectLoggedIn) {
        // Nếu không có userId và đây là trang yêu cầu redirect logged in user, cho phép truy cập
        setIsAuthorized(true);
      }
      setLoading(false);
      return;
    }

    // Nếu có userId và đây là trang yêu cầu redirect logged in user, chuyển hướng
    if (redirectLoggedIn) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    fetchGet(
      `/api/admin/user/get/${userId}`,
      (res) => {
        const user = res.data;
        setUserRole(user.role_id);
        
        if (requireAdmin) {
          // Chỉ cho phép role_id = 2 (admin) vào admin routes
          setIsAuthorized(user.role_id === 2);
        } else if (requireStaffOrAdmin) {
          // Cho phép role_id = 2 (admin) hoặc role_id = 3 (staff)
          setIsAuthorized(user.role_id === 2 || user.role_id === 3);
        } else {
          // Cho phép tất cả user đã đăng nhập
          setIsAuthorized(true);
        }
        setLoading(false);
      },
      () => {
        setIsAuthorized(false);
        setLoading(false);
      }
    );
  }, [userId, requireAdmin, requireStaffOrAdmin, redirectLoggedIn]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Nếu yêu cầu redirect logged in user và user đã đăng nhập
  if (redirectLoggedIn && userId && !isAuthorized) {
    // Chuyển về trang phù hợp với role
    if (userRole === 2) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 3) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Nếu yêu cầu admin nhưng user không phải admin, chuyển về trang phù hợp
  if (requireAdmin && userId && !isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Nếu yêu cầu staff/admin nhưng user không đủ quyền, chuyển về trang phù hợp
  if (requireStaffOrAdmin && userId && !isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
  if (!redirectLoggedIn && (!userId || !isAuthorized)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
