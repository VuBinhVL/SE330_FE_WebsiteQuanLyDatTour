import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainRoutes from "./app/routes/MainRoutes";

export default function App() {
  return (
    <>
      <MainRoutes />
      <ToastContainer />
    </>
  );
}
