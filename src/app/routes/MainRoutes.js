import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminLayout from "../layouts/adminLayout/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Report from "../pages/Admin/Report";
import CustomerLayout from "../layouts/customerLayout/CustomerLayout";
import Home from "../pages/Customer/Home";
import DestinationMainPage from "../pages/Admin/DestinationManagement/DestinationMainPage";
import Login from "../pages/Other/Login";
import Register from "../pages/Other/Register";
import ForgetPassword from "../pages/Other/ForgetPassword";
import Search from "../pages/Customer/Search";
import CustomerMainPage from "../pages/Admin/CustomerManagement/CustomerMainPage";
import EmployeeManagement from "../pages/Admin/EmployeeManagement/EmployeeManagement";
import TourBookingManagement from "../pages/Admin/TourBookingManagement/TourBookingManagement";
import BookingDetail from "../pages/Admin/TourBookingManagement/BookingDetail";
import OrderManagement from "../pages/Admin/OrderManagement/OrderManagement";
import OrderDetail from "../pages/Admin/OrderManagement/OrderDetail";
import TourRouteMainPage from "../pages/Admin/TourRouteManagement/TourRouteMainPage";
import DetailTourRoute from "../components/Admin/TourRouteManagement/DetailTourRoute/DetailTourRoute";
import TourMainPage from "../pages/Admin/TourManagement/TourMainPage";
import DetailTour from "../components/Admin/TourManagement/DetailTour/DetailTour";
import Account from "../pages/Other/Account";
import Cart from "../pages/Customer/Cart";
import Member from "../pages/Customer/Member";
import Favorites from "../pages/Customer/Favorites";
import DetailCustomerPage from "../components/Admin/CustomerManagement/DetailCustomerPage/DetailCustomerPage";
import BookingHistory from "../pages/Customer/BookingHistory";
import TourDetail from "../pages/Customer/TourDetail";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import Payment from "../pages/Customer/Payment";
import HelpPage from "../pages/Customer/HelpPage/HelpPage";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireStaffOrAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Routes cho cả Admin và Staff */}
          <Route
            path="dashboard"
            index
            element={
              <ProtectedRoute requireStaffOrAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route path="account" element={<Account />} />

          {/* Routes chỉ dành cho Admin và Staff - Quản lý khách hàng */}
          <Route
            path="customers"
            element={
              <ProtectedRoute requireStaffOrAdmin={true}>
                <CustomerMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="customers/:id"
            element={
              <ProtectedRoute requireStaffOrAdmin={true}>
                <DetailCustomerPage />
              </ProtectedRoute>
            }
          />

          {/* Routes chỉ dành cho Admin - Quản lý tour route */}
          <Route
            path="tour-route"
            element={
              <ProtectedRoute requireAdmin={true}>
                <TourRouteMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tour-route/get/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <DetailTourRoute />
              </ProtectedRoute>
            }
          />

          {/* Routes chỉ dành cho Admin và Staff - Quản lý tour */}
          <Route
            path="tour"
            element={
              <ProtectedRoute requireStaffOrAdmin={true}>
                <TourMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tour/get/:id"
            element={
              <ProtectedRoute requireStaffOrAdmin={true}>
                <DetailTour />
              </ProtectedRoute>
            }
          />

          {/* Routes chỉ dành cho Admin - Quản lý điểm đến và nhân viên */}
          <Route
            path="destination-management"
            element={
              <ProtectedRoute requireAdmin={true}>
                <DestinationMainPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="staff"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          ></Route>

          {/* Routes cho cả Admin và Staff - Quản lý booking */}
          <Route
            path="tour-bookings"
            element={<TourBookingManagement />}
          ></Route>
          <Route
            path="tour-bookings/detail-booking/:bookingId"
            element={<BookingDetail />}
          ></Route>

          {/* Routes cho cả Admin và Staff - Quản lý hóa đơn */}
          <Route path="invoices" element={<OrderManagement />}></Route>
          <Route
            path="invoices/detail/:invoiceId"
            element={<OrderDetail />}
          ></Route>
        </Route>

        {/* Customer */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="search" element={<Search />} />
          <Route
            path="login"
            element={
              <ProtectedRoute redirectLoggedIn={true}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="register"
            element={
              <ProtectedRoute redirectLoggedIn={true}>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="forget-password"
            element={
              <ProtectedRoute redirectLoggedIn={true}>
                <ForgetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="cart" element={<Cart />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="members" element={<Member />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="tour-detail/:id" element={<TourDetail />} />
          <Route path="payment" element={<Payment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
