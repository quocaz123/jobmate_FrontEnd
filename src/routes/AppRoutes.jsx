import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import Authenticate from "../pages/auth/Authenticate";
import SignupPage from "../pages/auth/SignUp";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import SetPasswordPage from "../pages/auth/SetPasswordPage";
import ProtectRoute from "./ProtectedRoute";
import Unauthorized from "../pages/auth/Unauthorized";
import UserPage from "../pages/user/UserPage";
import EmployerPage from "../pages/employer/EmployerPage";
import AdminPage from "../pages/admin/AdminPage";
import Overview from "../pages/Common/Overview";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/authenticate" element={<Authenticate />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/set-password" element={<SetPasswordPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/" element={<Overview />} />

                {/* User Routes */}
                <Route element={<ProtectRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN", "ROLE_EMPLOYER"]} />}>
                    <Route path="/home" element={<UserPage />} />
                    {/* <Route path="/profile" element={<Profile />} /> */}
                </Route>

                {/* Employer Routes */}
                <Route element={<ProtectRoute allowedRoles={["ROLE_EMPLOYER", "ROLE_ADMIN"]} />}>
                    <Route path="/employer" element={<EmployerPage />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectRoute allowedRoles={["ROLE_ADMIN"]} />}>
                    <Route path="/admin" element={<AdminPage />} />
                </Route>

                {/* REDIRECT DEFAULT */}
                {/* <Route path="/" element={<Navigate to="/user" replace />} /> */}
                <Route path="/home" element={<Navigate to="/user" replace />} />
                <Route path="/dashboard" element={<Navigate to="/user" replace />} />
                <Route path="*" element={<Navigate to="/user" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;