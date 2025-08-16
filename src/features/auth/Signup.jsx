import React, { useState } from "react";
import useSignup from "./useSignUp";
import { Link, useNavigate } from "react-router-dom";
import useGoogleSignIn from './useGoogleSignIn'

const Signup = () => {
  const navigate = useNavigate();
  const { signup, error, loading } = useSignup();
  const { signInWithGoogle, loading: gLoading, error: gError } = useGoogleSignIn();
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await signup(form);
    if (user) {
      navigate("/profile");
    }
  };

  const handleGoogle = async () => {
    const user = await signInWithGoogle();
    if (user) navigate('/profile');
  };

  // Map Firebase error messages to friendly messages
  const getFriendlyError = (err) => {
    if (!err) return null;
    const lower = (typeof err === 'string' ? err : err.message || JSON.stringify(err)).toLowerCase();
    if (lower.includes("email-already-in-use") || lower.includes("already in use")) {
      return "An account with this email already exists. Please sign in.";
    }
    if (lower.includes("invalid-email")) return "Please provide a valid email address.";
    if (lower.includes("weak-password")) return "Password is too weak. Use at least 6 characters.";
    return typeof err === 'string' ? err : err.message || JSON.stringify(err);
  };

  const friendlyError = getFriendlyError(error || gError);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1116]">
      <div className="w-full max-w-sm p-8">
        <div className="relative bg-gradient-to-b from-[#0a0b10] to-[#0f1116] border border-gray-800 rounded-2xl shadow-2xl p-6">
          <div className="absolute -inset-y-6 -inset-x-6 bg-gradient-to-br from-[#0b0811]/30 via-transparent to-[#0f0b14]/40 rounded-3xl blur-xl opacity-40 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white text-2xl font-bold">Sign Up</div>
              <Link to="/" className="text-sm text-gray-400 hover:text-white">Log In</Link>
            </div>

            <hr className="border-gray-800 mb-6" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Display name"
                  required
                  value={form.displayName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              {/* Google sign-in */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={gLoading}
                  className="w-full py-3 rounded-xl bg-white/5 border border-gray-700 text-white flex items-center justify-center gap-3 hover:bg-white/7 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.9 0 7.2 1.4 9.9 3.6l7.4-7.4C36.6 2 30.6 0 24 0 14.5 0 6.6 5.4 2.6 13l8.8 6.8C13.9 14.5 18.5 9.5 24 9.5z"/><path fill="#34A853" d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.9c-.6 3.2-2.6 6-5.6 7.9l8.6 6C44 38.9 46.9 32.4 46.9 24.5z"/><path fill="#4A90E2" d="M10.2 28.8c-1-2.9-1-6 0-8.8L1.4 13C-1 19.4-1 29.6 1.4 36l8.8-7.2z"/><path fill="#FBBC05" d="M24 48c6.6 0 12.6-2 17.3-5.5l-8.6-6c-2.4 1.6-5.3 2.6-8.7 2.6-5.4 0-10-4.8-11.4-11.2L2.6 35C6.6 42.6 14.5 48 24 48z"/></svg>
                  {gLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
                {gError && <div className="text-sm text-red-400 mt-2">{gError.message || gError}</div>}
              </div>

              {friendlyError && <div className="text-sm text-red-400 mt-2">{friendlyError}</div>}

              <div className="flex items-center justify-center text-sm text-gray-400 mt-3">
                <span className="mr-2">Already have an account?</span>
                <Link to="/" className="text-blue-400 hover:underline">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;