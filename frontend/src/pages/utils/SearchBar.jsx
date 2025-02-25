import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ users, onSearch }) => {
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setQuery(query);
        const filteredUsers = users.filter((user) => {
            const name = user.name ? user.name.toLowerCase() : "";
            const username = user.username ? user.username.toLowerCase() : "";
            return name.includes(query) || username.includes(query);
        });
        onSearch(filteredUsers);
    };

    return (
        <div className="w-full max-w-md mx-auto my-4">
            <div className="relative flex items-center bg-white shadow-lg rounded-lg px-2 border border-gray-300 transition focus-within:border-blue-500">
                <FaSearch className="text-gray-500 absolute left-4" />
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search chats..."
                    className="w-full pl-10 pr-4 py-2 text-gray-700 bg-transparent outline-none focus:ring-0 placeholder-gray-400"
                />
            </div>
        </div>
    );
};

export default SearchBar;
