import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/users/login", {
        email: email.trim(),
        password,
      });

      // Save token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.dispatchEvent(new Event("guardianband-auth-changed"));
      }

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response?.status === 403) {
        setError('Authentication failed.');
      } else if (err.response?.status === 404) {
        setError(err.response?.data?.message || 'Login endpoint not found.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Failed to connect to the local backend at http://localhost:3000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const goToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* =====================================================
            LEFT SIDE - GUARDIANBAND BRANDING
        ====================================================== */}

        <div className="hidden md:flex md:w-5/12 bg-blue-600 text-white p-10 lg:p-12 flex-col justify-between relative overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full opacity-40" />

          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-blue-700 rounded-full opacity-40" />

          {/* Content */}
          <div className="relative z-10">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">

              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <span className="text-blue-600 text-xl font-bold">
                  GB
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  GuardianBand
                </h1>

                <p className="text-blue-100 text-sm">
                  Child Safety & Well-being
                </p>
              </div>

            </div>

            {/* Main message */}
            <div className="max-w-sm">

              <p className="text-blue-100 text-sm font-medium mb-3">
                SMART CHILD MONITORING
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Your child's
                <br />
                safety,
                <br />
                <span className="text-blue-100">
                  always within reach.
                </span>
              </h2>

              <p className="text-blue-100 leading-relaxed mt-6">
                GuardianBand helps parents stay connected with their
                children's safety, location, health and daily activities.
              </p>

            </div>

          </div>

          {/* Safety indicators */}
          <div className="relative z-10 space-y-4">

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-green-300 text-sm">✓</span>
              </div>

              <div>
                <p className="font-medium text-sm">
                  Child Safety Monitoring
                </p>

                <p className="text-blue-100 text-xs">
                  Stay informed about your child's status
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-green-300 text-sm">✓</span>
              </div>

              <div>
                <p className="font-medium text-sm">
                  Real-Time Monitoring
                </p>

                <p className="text-blue-100 text-xs">
                  Receive important safety information
                </p>
              </div>
            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT SIDE - LOGIN FORM
        ====================================================== */}

        <div className="w-full md:w-7/12 p-7 sm:p-10 lg:p-14">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-10">

            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold">
                GB
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold text-blue-700">
                GuardianBand
              </h1>

              <p className="text-xs text-slate-500">
                Child Safety & Well-being
              </p>
            </div>

          </div>


          {/* Login heading */}
          <div className="max-w-md mx-auto">

            <div className="mb-8">

              <p className="text-blue-600 text-sm font-semibold mb-2">
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold text-slate-800">
                Sign in to GuardianBand
              </h2>

              <p className="text-slate-500 mt-2">
                Access your child's safety and monitoring dashboard.
              </p>

            </div>


            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="
                    w-full
                    px-4
                    py-3.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    text-slate-800
                    placeholder-slate-400
                    outline-none
                    transition
                    duration-200
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                />

              </div>


              {/* Password */}
              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={goToForgotPassword}
                    className="
                      text-sm
                      font-medium
                      text-blue-600
                      hover:text-blue-700
                      hover:underline
                    "
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="
                      w-full
                      px-4
                      py-3.5
                      pr-20
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      text-slate-800
                      placeholder-slate-400
                      outline-none
                      transition
                      duration-200
                      focus:bg-white
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  />


                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      font-semibold
                      text-blue-600
                      hover:text-blue-800
                    "
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>


              {/* Remember me */}
              <div className="flex items-center justify-between">

                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />

                  <span className="text-sm text-slate-500">
                    Remember me
                  </span>

                </label>

              </div>


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

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  active:bg-blue-800
                  disabled:bg-slate-400
                  disabled:cursor-not-allowed
                  text-white
                  font-semibold
                  py-3.5
                  rounded-xl
                  transition
                  duration-200
                  shadow-lg
                  shadow-blue-200
                  hover:shadow-blue-300
                  mt-2
                "
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>


            {/* Divider */}
            <div className="flex items-center gap-4 my-7">

              <div className="flex-1 h-px bg-slate-200" />

              <span className="text-xs text-slate-400">
                NEW TO GUARDIANBAND?
              </span>

              <div className="flex-1 h-px bg-slate-200" />

            </div>


            {/* Register button */}
            <button
              type="button"
              onClick={goToRegister}
              className="
                w-full
                border-2
                border-blue-600
                text-blue-600
                hover:bg-blue-50
                font-semibold
                py-3.5
                rounded-xl
                transition
                duration-200
              "
            >
              Create an Account
            </button>


            {/* Security message */}
            <div className="flex items-center justify-center gap-2 mt-7">

              <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-green-600 text-xs">
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Your account information is securely protected.
              </p>

            </div>

          </div>


          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-10">
            GuardianBand • Child Safety & Well-being
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;