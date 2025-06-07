import React from "react";
import CustomerHeader from "../Header";
import "./CustomerLayout.css";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="customer-container">
      <CustomerHeader />
      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}
