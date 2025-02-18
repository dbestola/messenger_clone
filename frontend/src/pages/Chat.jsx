import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Chat = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // List of users
  const [selectedUser, setSelectedUser] = useState(null); // Selected chat user
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) setUser(loggedUser);

    // Fetch users
    axios.get("http://localhost:5000/api/auth/users").then((res) => setUsers(res.data));

    // Listen for messages
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage"); // Cleanup
  }, []);

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const msgData = { sender: user._id, receiver: selectedUser._id, text: message };

    try {
      await axios.post("http://localhost:5000/api/messages", msgData);
      socket.emit("sendMessage", msgData);

      // Add the sent message to local state
      setMessages((prev) => [...prev, msgData]);
      setMessage("");
    } catch (error) {
      console.error("Message sending failed", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setSelectedUser(null);
    // Redirect to login or home page
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with users */}
      <div className="w-full sm:w-1/4 md:w-1/5 bg-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Users</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="flex flex-col space-y-2">
          {users.map((u) => (
            <button
              key={u._id}
              className={`flex items-center p-3 w-full text-left rounded-lg ${
                selectedUser?._id === u._id ? "bg-blue-500 text-white" : "bg-white"
              }`}
              onClick={() => setSelectedUser(u)}
            >
              <div className="w-8 h-8 bg-gray-400 rounded-full mr-3"></div> {/* Placeholder avatar */}
              <div>
                <span className="font-semibold">{u.username}</span>
                <span className={`text-sm ${u.status === "online" ? "text-green-500" : "text-gray-500"}`}>
                  {u.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full sm:w-3/4 md:w-4/5 flex flex-col bg-gray-200 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedUser ? `Chat with ${selectedUser.username}` : "Select a user"}
          </h2>
          {selectedUser && (
            <div className="text-sm text-gray-600">
              {selectedUser.status === "online" ? "Online" : "Offline"}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="bg-white p-4 rounded-lg shadow-md flex-grow overflow-auto">
          {messages
            .filter((msg) => msg.sender === selectedUser?._id || msg.receiver === selectedUser?._id)
            .map((msg, index) => (
              <div
                key={index}
                className={`p-2 my-2 rounded-lg ${
                  msg.sender === user._id
                    ? "bg-blue-500 text-white self-end"
                    : "bg-gray-300 text-black self-start"
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            ))}
        </div>

        {/* Input Box */}
        <div className="mt-4 flex">
          <input
            className="w-full p-3 border rounded-lg"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Send on Enter
          />
          <button
            className="bg-blue-500 text-white p-3 rounded-lg ml-2 hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
