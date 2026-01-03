'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="w-full shadow-md z-50">
            {/* Top Strip */}
            <div className="bg-gray-100 text-xs py-1 px-4 border-b border-gray-300 flex justify-between items-center text-gray-600">
                <div className="flex gap-4">
                    <span>Samadhan Setu Portal</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="cursor-pointer hover:text-blue-600 hidden sm:inline">Skip to Main Content</span>
                    <span className="text-gray-400 hidden sm:inline">|</span>
                    <button className="hover:text-black font-bold">A+</button>
                    <button className="hover:text-black">A</button>
                    <button className="hover:text-black text-xs">A-</button>
                    <span className="text-gray-400">|</span>
                    <button className="flex items-center gap-1 hover:text-blue-600">
                        <Globe size={12} /> English <ChevronDown size={10} />
                    </button>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white px-4 py-3 md:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-4 cursor-pointer">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                        SS
                    </div>

                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
                            Samadhan Setu
                        </h1>
                        <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-wide">
                            AI-Powered Grievance Platform
                        </p>
                    </div>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-blue-900 text-white px-4 md:px-8 py-0 shadow-lg overflow-x-auto">
                <ul className="hidden md:flex items-center gap-1 min-w-max">
                    <li>
                        <Link href="/" className="px-4 py-3 hover:bg-blue-800 cursor-pointer text-sm font-medium flex items-center gap-2 border-b-4 border-transparent hover:border-orange-500 transition-all">
                            <Home size={16} /> Home
                        </Link>
                    </li>

                    {user?.role === 'citizen' && (
                        <>
                            <li>
                                <Link href="/citizen/lodge" className="px-4 py-3 hover:bg-blue-800 cursor-pointer text-sm font-medium border-b-4 border-transparent hover:border-orange-500 transition-all block">
                                    Lodge Grievance
                                </Link>
                            </li>
                            <li>
                                <Link href="/citizen/track" className="px-4 py-3 hover:bg-blue-800 cursor-pointer text-sm font-medium border-b-4 border-transparent hover:border-orange-500 transition-all block">
                                    My Status
                                </Link>
                            </li>
                            <li>
                                <Link href="/citizen/community" className="px-4 py-3 hover:bg-blue-800 cursor-pointer text-sm font-medium border-b-4 border-transparent hover:border-orange-500 transition-all block">
                                    Community Feed
                                </Link>
                            </li>
                        </>
                    )}

                    {user?.role === 'officer' && (
                        <li>
                            <Link href="/department" className="px-4 py-3 hover:bg-blue-800 cursor-pointer text-sm font-medium border-b-4 border-transparent hover:border-orange-500 transition-all block">
                                Department Dashboard
                            </Link>
                        </li>
                    )}

                    {user?.role === 'admin' && (
                        <li>
                            <Link href="/admin" className="px-4 py-3 hover:bg-blue-800 cursor-pointer text-sm font-medium border-b-4 border-transparent hover:border-orange-500 transition-all block">
                                Admin Dashboard
                            </Link>
                        </li>
                    )}

                    <div className="flex-grow"></div>

                    {user ? (
                        <li className="px-4 py-3 bg-blue-950 flex items-center gap-3">
                            <div className="flex flex-col text-right leading-tight">
                                <span className="text-xs text-blue-200">Welcome,</span>
                                <span className="font-semibold text-sm">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs ml-2"
                            >
                                Logout
                            </button>
                        </li>
                    ) : (
                        <li>
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 cursor-pointer font-bold text-sm tracking-wide border-b-4 border-orange-800 block"
                            >
                                LOGIN / REGISTER
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <ul className="md:hidden flex flex-col py-2">
                        <li>
                            <Link href="/" className="px-4 py-3 hover:bg-blue-800 block" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                        </li>
                        {user?.role === 'citizen' && (
                            <>
                                <li><Link href="/citizen/lodge" className="px-4 py-3 hover:bg-blue-800 block" onClick={() => setMobileMenuOpen(false)}>Lodge Grievance</Link></li>
                                <li><Link href="/citizen/track" className="px-4 py-3 hover:bg-blue-800 block" onClick={() => setMobileMenuOpen(false)}>My Status</Link></li>
                                <li><Link href="/citizen/community" className="px-4 py-3 hover:bg-blue-800 block" onClick={() => setMobileMenuOpen(false)}>Community Feed</Link></li>
                            </>
                        )}
                        {user?.role === 'officer' && (
                            <li><Link href="/department" className="px-4 py-3 hover:bg-blue-800 block" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>
                        )}
                        {user?.role === 'admin' && (
                            <li><Link href="/admin" className="px-4 py-3 hover:bg-blue-800 block" onClick={() => setMobileMenuOpen(false)}>Admin</Link></li>
                        )}
                        {user ? (
                            <li>
                                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="px-4 py-3 text-red-300 hover:bg-blue-800 w-full text-left">
                                    Logout ({user.name})
                                </button>
                            </li>
                        ) : (
                            <li><Link href="/login" className="px-4 py-3 bg-orange-600 block" onClick={() => setMobileMenuOpen(false)}>Login / Register</Link></li>
                        )}
                    </ul>
                )}
            </nav>
        </header>
    );
}

