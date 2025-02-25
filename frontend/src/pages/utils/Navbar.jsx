import { FaSignOutAlt, FaBars, FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user, handleLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogoutWithToast = () => {
        toast.success("You have been logged out successfully!", {
            position: "top-right",
            autoClose: 3000, // Keep it open for 3 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    
        // Wait a short time before logging out to ensure the toast is displayed
        setTimeout(() => {
            handleLogout();
        }, 500); // 0.5s delay before logout
    };
    
    
    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Left - App Name or Logo */}
                <div className="flex items-center"
                onClick={() => navigate("/profile")}
                >
                    <FaUserCircle className="text-white text-4xl mr-3" />
                    {user && (
                        <span className="font-medium">
                            {user.username || user.name}
                        </span>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="sm:hidden text-white text-2xl"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <FaBars />
                </button>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center space-x-4">
                    <button
                        onClick={handleLogoutWithToast}
                        className="flex items-center bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden mt-2 bg-blue-700 p-3 rounded-md"
                onClick={() => navigate("/profile")}
                >
                    {user && (
                        <p className="text-center mb-2 font-medium">
                            {user.username || user.name}
                        </p>
                    )}
                    <button
                        onClick={handleLogoutWithToast}
                        className="flex justify-center items-center w-full bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
