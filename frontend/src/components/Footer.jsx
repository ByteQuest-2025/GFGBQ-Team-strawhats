import { Mail, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white pt-10 pb-4 text-sm mt-auto">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <h4 className="font-bold text-lg mb-4 text-gray-200">Samadhan Setu</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        An AI-powered platform bridging the gap between citizens and administration
                        for transparent and efficient grievance resolution.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-4 text-gray-300">Quick Links</h4>
                    <ul className="space-y-2 text-gray-400 text-xs">
                        <li className="hover:text-white cursor-pointer">About Us</li>
                        <li className="hover:text-white cursor-pointer">How It Works</li>
                        <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                        <li className="hover:text-white cursor-pointer">Terms of Service</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4 text-gray-300">Accessibility</h4>
                    <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
                        <span className="border border-gray-600 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                            Screen Reader
                        </span>
                        <span className="border border-gray-600 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                            High Contrast
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
                © {new Date().getFullYear()} Samadhan Setu. All rights reserved.
            </div>
        </footer>
    );
}

