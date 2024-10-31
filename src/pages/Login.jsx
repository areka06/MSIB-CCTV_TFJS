import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Camera, Monitor } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Back Button - Icon only */}
      <button 
    onClick={() => window.history.back()}
    className="absolute top-4 left-4 flex items-center p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg text-gray-600 hover:text-gray-900 z-20 transition-all hover:scale-105"
    aria-label="Back to Dashboard"
    >
    <ArrowLeft className="w-5 h-5 mr-2" />
    <span className="text-sm">Back to Dashboard</span>
    </button>

      {/* Left Section - Hero Banner (hidden on mobile) */}
      <div className="hidden md:flex w-full md:w-1/2 p-4 md:p-8 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600 rounded-full opacity-20 translate-x-1/4 translate-y-1/4" />
        
        <div className="relative z-10 max-w-lg mt-16">
          <div className="flex items-center gap-3 mb-12">
            <Camera className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-800">CCTV Management System</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            Smart CCTV Analytics Dashboard
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Advanced video analytics and monitoring system for comprehensive surveillance management.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 bg-red-600/10 rounded-xl flex items-center justify-center mb-3">
                <Camera className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Real-time Monitoring</h3>
              <p className="text-sm text-gray-500">Live video feeds with intelligent object detection and counting.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 bg-red-600/10 rounded-xl flex items-center justify-center mb-3">
                <Monitor className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Analytics Dashboard</h3>
              <p className="text-sm text-gray-500">Comprehensive data visualization and reporting tools.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen md:min-h-0 p-4 md:p-8">
        <div className="w-full max-w-md -mt-16 md:mt-0">
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">CCTV System Login</h2>
              <p className="text-gray-500 mt-1">Access your surveillance dashboard</p>
            </div>
            
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="username@organization.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-sm text-red-600 hover:text-red-700 font-medium">Forgot Password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transform hover:scale-[1.02] transition-all font-medium"
              >
                Sign in
              </button>
            </form>
          </div>
          
          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Secure access system. By signing in, you agree to our{' '}
            <a href="#" className="text-red-600 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-red-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}