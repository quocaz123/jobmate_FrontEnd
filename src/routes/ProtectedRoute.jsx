import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../services/localStorageService";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  try {
    const token = getToken();
    if (!token) {
      console.warn("Không có token trong localStorage");
      return <Navigate to="/login" replace />;
    }

    const decoded = jwtDecode(token);
    const userRoles = decoded.scope?.split(" ") || [];


    const rolesArray = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    const hasAccess = userRoles.some((r) => rolesArray.includes(r));

    if (!hasAccess) {
      console.warn("User không có quyền truy cập:", userRoles);
      return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />
  } catch (err) {
    console.error("Lỗi decode token:", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
