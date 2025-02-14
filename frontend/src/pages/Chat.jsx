import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Chat = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) setUser(loggedUser);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  const sendMessage = async () => {
    if (!message) return;
    const msgData = { sender: user._id, text: message };
    await axios.post("http://localhost:5000/api/messages", msgData);
    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-200 p-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow overflow-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 my-2 rounded ${msg.sender === user._id ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        <input className="w-full p-2 border rounded" type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="bg-blue-500 text-white p-2 rounded ml-2" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
