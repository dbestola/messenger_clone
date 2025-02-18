import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../utils/http";

const url = import.meta.env.VITE_API_BASE_URL
const socket = io(url);

const Chat = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // List of users
  const [selectedUser, setSelectedUser] = useState(null); // Selected chat user
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) {
      setUser(loggedUser);
      socket.emit("setUser", loggedUser._id);  // Emit setUser event here to update status
    }

    // Fetch users
    axios.get("/api/auth/users")
      .then((res) => setUsers(res.data))
      .catch((error) => {
        console.error("Error fetching users:", error);
        // You can also show a message to the user, e.g.:
        alert("Failed to load users. Please try again later.");
      });


    // Listen for user status updates
    socket.on("updateUserStatus", (updatedUsers) => {
      // Update the users' statuses in the UI
      setUsers((prevUsers) => {
        return prevUsers.map((u) => ({
          ...u,
          status: updatedUsers[u._id]?.status || u.status, // Update the status if available
        }));
      });
    });


    // Listen for messages
    socket.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      setMessages((prev) => {
        // Prevent duplicate messages
        if (!prev.find(msg => msg._id === data._id)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    return () => {
      // Emit user disconnect event
      if (loggedUser) {
        socket.emit("userDisconnect", loggedUser._id);
      }
      socket.off("updateUserStatus");
      socket.off("receiveMessage");
    };
  }, []);

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
      axios.get(`/api/messages/${user._id}/${selectedUser._id}`)
        .then((res) => setMessages(res.data))
        .catch((error) => console.error("Error fetching chat history:", error));
    }
  
  }, [selectedUser]);
  

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const msgData = { sender: user._id, receiver: selectedUser._id, text: message };

    try {
      const response = await axios.post("/api/messages", msgData);

      if (response.status === 201) {
        socket.emit("sendMessage", msgData); // Send to the server, let it broadcast
        setMessage(""); // Clear input
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
    // Redirect to login or home page
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-gray-100">
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
              className={`flex items-center p-3 w-full text-left rounded-lg ${selectedUser?._id === u._id ? "bg-blue-500 text-white" : "bg-white"
                }`}
              onClick={() => setSelectedUser(u)}
            >
              <div className="w-8 h-8 bg-gray-400 rounded-full mr-3"></div> {/* Placeholder avatar */}
              <div>
                <span className="font-semibold">{u?.username || u?.name} </span>
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
            {selectedUser ? `Chat with ${selectedUser?.username || selectedUser?.name}` : "Select a user"}
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
                className={`p-2 my-2 rounded-lg ${msg.sender === user._id
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-300 text-black self-start"
                  }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "N/A"}
                </div>
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
