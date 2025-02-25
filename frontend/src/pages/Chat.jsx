import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../utils/http";
import { FaArrowLeft } from "react-icons/fa"; // for the back icon
import Navbar from "./utils/Navbar";
import SearchBar from "./utils/SearchBar";
import { useNavigate } from "react-router-dom";

const url = import.meta.env.VITE_API_BASE_URL;
const socket = io(url);

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) {
      setUser(loggedUser);
      socket.emit("setUser", loggedUser._id);
    }

    axios
      .get("/api/auth/users")
      .then((res) => setUsers(res.data))
      .catch((error) => {
        console.error("Error fetching users:", error);
        alert("Failed to load users. Please try again later.");
      });

    socket.on("updateUserStatus", (updatedUsers) => {
      setUsers((prevUsers) => {
        return prevUsers.map((u) => ({
          ...u,
          status: updatedUsers[u._id]?.status || u.status,
        }));
      });
    });

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => {
        if (!prev.find((msg) => msg._id === data._id)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    // Check if it's a mobile device
    setIsMobile(window.innerWidth <= 768);

    window.addEventListener("resize", () => {
      setIsMobile(window.innerWidth <= 768);
    });

    return () => {
      if (loggedUser) {
        socket.emit("userDisconnect", loggedUser._id);
      }
      socket.off("updateUserStatus");
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);


  useEffect(() => {
    if (messages.length) {
      localStorage.setItem(`chat_${user._id}_${selectedUser?._id}`, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;

    const cachedMessages = localStorage.getItem(`chat_${user._id}_${selectedUser._id}`);
    if (cachedMessages) {
      setMessages(JSON.parse(cachedMessages));
    } else {
      axios
        .get(`/api/messages/${user._id}/${selectedUser._id}`)
        .then((res) => setMessages(res.data))
        .catch((error) => console.error("Error fetching chat history:", error));
    }
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const msgData = { sender: user._id, receiver: selectedUser._id, text: message };

    try {
      const response = await axios.post("/api/messages", msgData);

      if (response.status === 201) {
        socket.emit("sendMessage", msgData);
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setSelectedUser(null);
    navigate("/");
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-gray-100">
      {/* Sidebar - Mobile View */}
      {!selectedUser && isMobile ? (
        <>
          <Navbar user={user} handleLogout={handleLogout} />

          <div className="w-full bg-white shadow-lg p-4 space-y-4 min-h-screen">
            <div className="flex flex-col items-start">
              {/* Pass users & handle filtered results */}
            <SearchBar users={users} onSearch={setFilteredUsers} />
            </div>

            <div className="space-y-2">
              {filteredUsers
                .filter((u) => u._id !== user?._id)
                .map((u) => (
                  <button
                    key={u._id}
                    className={`flex items-center p-3 w-full text-left rounded-md transition-colors duration-300 ${selectedUser?._id === u._id
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-100"
                      }`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="w-8 h-8 bg-gray-400 rounded-full mr-3"></div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{u?.username || u?.name}</span>
                      <span
                        className={`text-sm ${u.status === "online" ? "text-green-500" : "text-gray-500"
                          }`}
                      >
                        {u.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Chat Section - Mobile View */}
      {selectedUser && isMobile ? (
        <div className="w-full flex flex-col bg-gray-200 p-4 min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-blue-500"
            >
              <FaArrowLeft /> Back to Chats
            </button>
            <div>
              <h2 className="text-xl font-semibold">
                {selectedUser?.username || selectedUser?.name}
              </h2>
              <div className="text-sm text-gray-600">
                {selectedUser.status === "online" ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow bg-white p-4 shadow-md rounded-md overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-max p-3 my-2 rounded-lg text-sm ${msg.sender === user._id
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-black mr-auto"
                  }`}
              >
                {msg.text}
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center mt-4">
            <input
              className="w-full p-3 border rounded-lg"
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="bg-blue-500 text-white p-3 rounded-lg ml-2"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}

      {/* Desktop View - Sidebar and Chat Section */}
      {!isMobile && (

        <div className="w-1/3 bg-white p-4 shadow-lg h-screen overflow-y-auto">

          <div className="mb-4 w-full">
            {/* Navbar for Desktop */}
            <Navbar user={user} handleLogout={handleLogout} />
          </div>
          <div className="flex flex-col items-start">
              {/* Pass users & handle filtered results */}
            <SearchBar users={users} onSearch={setFilteredUsers} />
            </div>


          <div className="space-y-2">
            {filteredUsers
              .filter((u) => u._id !== user?._id)
              .map((u) => (
                <button
                  key={u._id}
                  className={`flex items-center p-3 w-full text-left rounded-md transition-colors duration-300 ${selectedUser?._id === u._id
                    ? "bg-blue-500 text-white"
                    : "bg-white hover:bg-gray-100"
                    }`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="w-8 h-8 bg-gray-400 rounded-full mr-3"></div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{u?.username || u?.name}</span>
                    <span
                      className={`text-sm ${u.status === "online" ? "text-green-500" : "text-gray-500"}`}
                    >
                      {u.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {!isMobile && selectedUser && (
        <div className="flex-grow p-4 bg-gray-200 h-screen flex flex-col">

          <h2 className="text-xl font-semibold mb-4">{selectedUser?.username || selectedUser?.name} </h2>



          {/* Chat Messages */}
          <div className="flex-grow bg-white p-4 shadow-md rounded-md overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs p-3 my-2 rounded-lg text-sm ${msg.sender === user._id
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-black mr-auto"
                  }`}
              >
                {msg.text}
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center mt-4">
            <input
              className="w-full p-3 border rounded-lg"
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="bg-blue-500 text-white p-3 rounded-lg ml-2"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>

      )}

    </div>
  );
};

export default Chat;
