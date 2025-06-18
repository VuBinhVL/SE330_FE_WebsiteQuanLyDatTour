import React, { useState } from "react";
import "./AdminLayout.css";
import Navigation from "../Navigation";
import AdminHeader from "../Header";
import { Outlet } from "react-router-dom";

export const AdminTitleContext = React.createContext();

export default function AdminLayout() {

  const [title, setTitle] = useState("Trang quản trị");
  const [subtitle, setSubtitle] = useState("Quản lý hệ thống đặt tour");


  return (
    <AdminTitleContext.Provider value={{ title, subtitle, setTitle, setSubtitle }}>
      <div className="admin-container">
        <Navigation />
        <div className="admin-main">
          <AdminHeader />
          
          <main className="admin-content">
            <Outlet />
          </main>
        </div>1
      </div>
     </AdminTitleContext.Provider>
  );
}
