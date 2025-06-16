import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./app/lib/AuthContext";
import MainRoutes from "./app/routes/MainRoutes";

export default function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <MainRoutes />
        <ToastContainer />
      </AuthProvider>
    </React.StrictMode>
  );
}
