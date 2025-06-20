import React from "react";
import { useParams } from "react-router-dom";
import DetailCustomer from "../../../../components/Admin/CustomerManagement/DetailCustomer/DetailCustomer";

export default function DetailCustomerPage() {
  const { id } = useParams();
  return <DetailCustomer customerId={id} />;
}