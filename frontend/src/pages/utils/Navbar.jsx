import { FaSignOutAlt, FaBars, FaUserCircle, FaTimes } from "react-icons/fa";
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
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });

        setTimeout(() => {
            handleLogout();
        }, 500);
    };

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Left - App Name or Logo */}
                <div
                    className="flex items-center cursor-pointer"
                    onClick={() => navigate("/profile")}
                >
                    <FaUserCircle className="text-white text-4xl mr-3" />
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="sm:hidden text-white text-2xl"
                    onClick={() => setIsMobileMenuOpen(true)}
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

            {/* Mobile Logout Modal */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                        <h3 className="text-gray-600 font-semibold mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Click on LogOut if you want to log out</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogoutWithToast}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Close Modal on Outside Click */}
                    <button
                        className="absolute top-4 right-4 text-white text-3xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
