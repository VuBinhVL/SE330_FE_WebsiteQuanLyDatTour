import React from "react";
import "./DetailDestination.css";

export default function DetailDestination({ onCloseAddForm }) {
  return (
    <>
      <div className="des-detail-overlay" onClick={onCloseAddForm}></div>
      <div className="des-detail-form"></div>
    </>
  );
}
