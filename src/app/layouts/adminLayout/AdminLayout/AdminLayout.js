import React from "react";
import "./AdminLayout.css";
import Navigation from "../Navigation";
import AdminHeader from "../Header";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <Navigation />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
