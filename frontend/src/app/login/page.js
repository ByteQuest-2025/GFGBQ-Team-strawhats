'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { authAPI } from '@/lib/api';
import { CheckCircle } from 'lucide-react';

export default function LoginPage() {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            if (mode === 'login') {
                response = await authAPI.login(email, password);
            } else {
                response = await authAPI.register({ email, password, name, role: 'citizen' });
            }

            login(response.user, response.access_token);

            // Redirect based on role
            if (response.user.role === 'citizen') {
                router.push('/citizen/lodge');
            } else if (response.user.role === 'officer') {
                router.push('/department');
            } else if (response.user.role === 'admin') {
                router.push('/admin');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] bg-gray-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Info */}
                <div className="md:w-1/2 bg-blue-900 p-8 text-white flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">Welcome to Samadhan Setu</h3>
                    <p className="mb-6 opacity-90">Please login to continue using the grievance redressal services.</p>
                    <ul className="space-y-3 text-sm opacity-80">
                        <li className="flex items-center gap-2"><CheckCircle size={16} /> 24/7 Grievance Submission</li>
                        <li className="flex items-center gap-2"><CheckCircle size={16} /> Real-time Status Tracking</li>
                        <li className="flex items-center gap-2"><CheckCircle size={16} /> AI-Powered Classification</li>
                        <li className="flex items-center gap-2"><CheckCircle size={16} /> Direct Department Connect</li>
                    </ul>
                </div>

                {/* Right Side - Forms */}
                <div className="md:w-1/2 p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {mode === 'login' ? 'Login to Your Account' : 'Create New Account'}
                    </h3>

                    {/* Login/Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-2 rounded transition"
                        >
                            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
                        </button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        {mode === 'login' ? (
                            <>
                                Don&apos;t have an account?{' '}
                                <button onClick={() => setMode('register')} className="text-blue-600 font-semibold">
                                    Register
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button onClick={() => setMode('login')} className="text-blue-600 font-semibold">
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

