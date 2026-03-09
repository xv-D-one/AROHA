import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Login = () => {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {

      const user = await login(email, password);

      // optional role check from UI
      if (user.role.toLowerCase() !== selectedRole) {
        setError("Selected role does not match your account.");
        setIsLoading(false);
        return;
      }

      // redirect based on role
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "DOCTOR") {
        navigate("/doctor/dashboard");
      } else if (user.role === "PATIENT") {
        navigate("/patient/dashboard");
      }

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: "admin", label: "Admin", icon: "👨‍⚕️", color: "from-purple-500 to-indigo-600" },
    { id: "doctor", label: "Doctor", icon: "👩‍⚕️", color: "from-blue-500 to-cyan-500" },
    { id: "patient", label: "Patient", icon: "🧑", color: "from-emerald-500 to-teal-500" }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background animations remain unchanged */}

      <div className="relative w-full max-w-sm">

        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">

          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl mb-2 shadow-lg">
              <span className="text-3xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Aroha AI
            </h1>
            <p className="text-gray-300 text-xs mt-1">AI-Powered Medical Records</p>
          </div>

          {/* Role selection */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Select Your Role
            </label>

            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    selectedRole === role.id
                      ? `bg-linear-to-r ${role.color} text-white shadow-lg`
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-0.5">
                    <span className="text-xl">{role.icon}</span>
                    <span className="text-[10px] font-medium">{role.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white"
              placeholder="Email"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white"
              placeholder="Password"
              required
            />

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;