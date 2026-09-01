import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">

          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-2xl font-bold">
              GB
            </span>
          </div>

          <h1 className="text-3xl font-bold text-blue-700 mt-4">
            GuardianBand
          </h1>

          <p className="text-gray-500 mt-1">
            Child Safety & Well-being
          </p>

        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">

          {!submitted ? (
            <>
              {/* Title */}
              <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-800">
                  Forgot Password?
                </h2>

                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Don't worry. Enter your email address and we'll help you
                  reset your password.
                </p>

              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md shadow-blue-200"
                >
                  Send Reset Link
                </button>

              </form>

              {/* Back to login */}
              <div className="text-center mt-6">

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  ← Back to Login
                </button>

              </div>
            </>
          ) : (

            /* Success message */
            <div className="text-center py-6">

              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <span className="text-green-600 text-3xl">
                  ✓
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Check Your Email
              </h2>

              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                If an account exists for
                <span className="font-semibold text-gray-700">
                  {" "}{email}
                </span>
                , we've sent instructions to reset your password.
              </p>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Back to Login
              </button>

            </div>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          GuardianBand • Child Safety & Well-being
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;