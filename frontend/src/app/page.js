'use client';

import Link from 'next/link';
import { FileText, Activity, CheckCircle, Shield, Clock, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Empowering Citizens, Enabling Governance
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            An AI-powered bridge connecting your voice directly to the right government department.
            Report issues, track progress, and build a better city together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded shadow-lg transform transition hover:-translate-y-1"
            >
              Lodge a Complaint
            </Link>
            <Link
              href="/citizen/community"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-8 rounded transition"
            >
              View Community Issues
            </Link>
          </div>
        </div>
      </div>

      {/* Key Benefits Strip */}
      <div className="bg-white shadow-md -mt-8 mx-4 md:mx-auto max-w-5xl rounded-lg p-6 relative z-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t-4 border-green-500">
        <div className="flex flex-col items-center">
          <Shield className="text-blue-600 mb-2" size={32} />
          <div className="text-sm text-gray-600 font-semibold">Secure & Transparent</div>
        </div>
        <div className="flex flex-col items-center">
          <Activity className="text-orange-500 mb-2" size={32} />
          <div className="text-sm text-gray-600 font-semibold">AI-Powered Routing</div>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="text-green-600 mb-2" size={32} />
          <div className="text-sm text-gray-600 font-semibold">Real-time Tracking</div>
        </div>
        <div className="flex flex-col items-center">
          <Users className="text-purple-600 mb-2" size={32} />
          <div className="text-sm text-gray-600 font-semibold">Community Driven</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-12 relative pb-2">
          How Samadhan Setu Works
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-orange-500"></span>
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-100 text-center">
            <div className="flex justify-center mb-4">
              <FileText size={40} className="text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-800">1. Easy Submission</h4>
            <p className="text-gray-600">Submit grievances in seconds via web. No paperwork needed.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-100 text-center">
            <div className="flex justify-center mb-4">
              <Activity size={40} className="text-orange-500" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-800">2. AI Processing</h4>
            <p className="text-gray-600">Our AI automatically categorizes your issue and assigns urgency levels.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-100 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-800">3. Quick Resolution</h4>
            <p className="text-gray-600">Direct routing to officials ensures faster action and accountability.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Make Your Voice Heard?</h3>
          <p className="text-blue-200 mb-6">Join thousands of citizens working together for a better community.</p>
          <Link
            href="/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded shadow-lg transition"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

