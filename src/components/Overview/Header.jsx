import React from "react";
import { useNavigate } from "react-router-dom";
import GuideModal from "./GuideModal";
import logoImg from "../../assets/logo.jpg";

export default function Header() {
    const navigate = useNavigate();
    const [showGuide, setShowGuide] = React.useState(false);

    return (
        <>
            <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
            <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-white shadow-sm border-b border-gray-200">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <img
                        src={logoImg}
                        alt="JobMate"
                        className="w-10 h-10 rounded-lg object-cover"
                    />
                    <h1 className="text-xl font-bold">JobMate</h1>
                </div>

                {/* Menu */}
                <nav className="flex items-center space-x-6 font-medium text-gray-800">
                    <button onClick={() => navigate("/login")} className="hover:text-gray-600">
                        Tìm việc
                    </button>
                    <button onClick={() => navigate("/login")} className="hover:text-gray-600">
                        Đăng tin
                    </button>
                    <button onClick={() => setShowGuide(true)} className="hover:text-gray-600">
                        Hướng dẫn
                    </button>
                    <button onClick={() => navigate("/login")} className="hover:text-gray-600">
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                    >
                        Đăng ký
                    </button>
                </nav>
            </header>
        </>
    );
}