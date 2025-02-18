import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/http";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);

    if (!username || !email || !password) {
      console.error("All fields are required");
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log("Trimmed Username:", trimmedUsername);
    console.log("Trimmed Email:", trimmedEmail);
    console.log("Trimmed Password:", trimmedPassword);

    try {
      await axios.post("/api/auth/register", {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      navigate("/");
    } catch (err) {
      console.error("Error Response: ", err.response ? err.response.data : err);
    }
  };


  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
