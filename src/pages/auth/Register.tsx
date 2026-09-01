import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setnumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    if (!number.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!confirmPassword) {
      setError("Password confirmation is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/register",
        {
          name: name.trim(),
          email: email.trim(),
          number: number.trim(),
          password,
          confirmPassword,
        }
      );
      console.log(
        "hello"
      )

      setSuccess(
        response.data.message || "Account created successfully! Redirecting to login..."
      );
      
      // Clear form
      setName("");
      setEmail("");
      setnumber("");
      setPassword("");
      setConfirmPassword("");
      setAgreeTerms(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError("Failed to connect to server. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDE - BRANDING */}
        <div className="hidden md:flex md:w-5/12 bg-blue-600 text-white p-10 flex-col justify-between">
          
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">GB</span>
              </div>

              <div>
                <h1 className="text-xl font-bold">GuardianBand</h1>
                <p className="text-blue-100 text-xs">
                  Child Safety & Well-being
                </p>
              </div>
            </div>

            {/* Main message */}
            <h2 className="text-3xl font-bold leading-tight mb-5">
              Protect.
              <br />
              Monitor.
              <br />
              Care.
            </h2>

            <p className="text-blue-100 leading-relaxed">
              Create your GuardianBand account and stay connected
              to your child's safety, health and daily activities.
            </p>
          </div>

          {/* Safety indicators */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-50">
                Child safety monitoring
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-50">
                Real-time protection
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-50">
                Secure parental access
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - REGISTER FORM */}
        <div className="w-full md:w-7/12 p-7 sm:p-10">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">GB</span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-blue-700">
                GuardianBand
              </h1>
              <p className="text-xs text-slate-500">
                Child Safety & Well-being
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-800">
              Create your account
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Start monitoring and protecting your child with GuardianBand.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200
                bg-slate-50 text-slate-800 outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>

              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200
                bg-slate-50 text-slate-800 outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={number}
                onChange={(e) => setnumber(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200
                bg-slate-50 text-slate-800 outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-16 rounded-xl border border-slate-200
                  bg-slate-50 text-slate-800 outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  transition disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                  text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-16 rounded-xl border border-slate-200
                  bg-slate-50 text-slate-800 outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  transition disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2
                  text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <p className="text-xs text-slate-500 leading-relaxed">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>

            {/* Create Account */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed
              text-white font-semibold py-3.5 rounded-xl
              transition duration-200 shadow-md shadow-blue-200
              mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-7">
            GuardianBand • Child Safety & Well-being
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;