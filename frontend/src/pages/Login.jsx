import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/http";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      setLoading(true)
      const { data } = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/chat");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input className="w-full mb-2 p-2 border rounded" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full mb-2 p-2 border rounded" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">{loading ? "Loading..." : "Log in"}</button>
        <p className="text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
