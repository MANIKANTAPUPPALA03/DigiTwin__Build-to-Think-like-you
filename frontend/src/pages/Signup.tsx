import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup: React.FC = () => {
  const { signup, loginWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch {
      // error already handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-blue-600">DT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create Account
          </h1>
          <p className="text-slate-500">
            Start your journey with DigiTwin
          </p>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}   // ✅ THIS was missing/broken
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative bg-white px-4 text-sm text-slate-400">
            or
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors ${loading ? "opacity-70 cursor-wait" : ""
              }`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
