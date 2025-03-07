import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/http";
import { FiUser, FiMail, FiPhone, FiShield, FiArrowLeft } from "react-icons/fi";

const Profile = () => {
    const { id } = useParams(); // Get user ID from the URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Unauthorized: No token found");
                    setLoading(false);
                    return;
                }

                const endpoint = id ? `/api/auth/user/${id}` : "/api/auth/profile"; // Fetch another user's profile if ID is present
                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("Profile Response:", response.data);
                setUser(response.data);
            } catch (err) {
                setError("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]); // Refetch when ID changes

    if (loading) return <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
    </div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg mt-10 text-gray-800">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
            >
                <FiArrowLeft className="mr-2" />
                Back
            </button>

            <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl">
                    <FiUser />
                </div>
                <h2 className="text-2xl font-semibold mt-4">{user.fullName}</h2>
                <p className="text-gray-600">@{user.username}</p>
            </div>

            <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                    <FiMail className="text-blue-500" />
                    <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FiPhone className="text-green-500" />
                    <span className="text-gray-700">{user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FiShield className="text-purple-500" />
                    <span className="text-gray-700 capitalize">{user.role}</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
