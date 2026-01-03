'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { complaintsAPI } from '@/lib/api';
import { FileText, MapPin, CheckCircle, Activity, Loader2, Navigation, ImagePlus, X, AlertCircle } from 'lucide-react';

export default function LodgeGrievance() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [ward, setWard] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [images, setImages] = useState([]);

    const [aiCategory, setAiCategory] = useState('');
    const [aiPriority, setAiPriority] = useState('Low');
    const [aiConfidence, setAiConfidence] = useState(0);
    const [aiLoading, setAiLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // AI Preview - debounced
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (description.length >= 10) {
                setAiLoading(true);
                try {
                    const result = await complaintsAPI.previewAI(description);
                    setAiCategory(result.category || 'General');
                    setAiPriority(result.priority || 'Low');
                    setAiConfidence(Math.round(result.confidence * 100) || 0);
                } catch (err) {
                    console.log('AI preview failed:', err);
                    // Show fallback values
                    setAiCategory('General');
                    setAiPriority('Medium');
                    setAiConfidence(70);
                } finally {
                    setAiLoading(false);
                }
            } else {
                setAiCategory('');
                setAiPriority('Low');
                setAiConfidence(0);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [description]);

    // Auto-detect location with IP fallback
    const getAutoLocation = useCallback(async () => {
        setLocationLoading(true);
        setError('');

        // Try GPS first, then fallback to IP-based location
        const tryGPS = () => {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('GPS not supported'));
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'GPS' }),
                    (err) => reject(err),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            });
        };

        // IP-based fallback
        const tryIPLocation = async () => {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.city) {
                return { city: data.city, region: data.region, country: data.country_name, source: 'IP' };
            }
            throw new Error('IP location failed');
        };

        try {
            // Try GPS first
            const coords = await tryGPS();
            try {
                // Reverse geocode the GPS coordinates
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`,
                    { headers: { 'User-Agent': 'SamadhanSetu/1.0' } }
                );
                const data = await response.json();
                if (data.display_name) {
                    const addr = data.address;
                    const parts = [addr.road, addr.suburb, addr.city || addr.town, addr.state].filter(Boolean);
                    setLocation(parts.join(', ') || data.display_name);
                } else {
                    setLocation(`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
                }
            } catch {
                setLocation(`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
            }
        } catch (gpsError) {
            // GPS failed, try IP-based location
            try {
                const ipData = await tryIPLocation();
                setLocation(`${ipData.city}, ${ipData.region}`);
            } catch {
                setError('Could not detect location. Please enter manually.');
            }
        } finally {
            setLocationLoading(false);
        }
    }, []);

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 3) {
            setError('Maximum 3 images allowed');
            return;
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, { url: e.target.result, file }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !location) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await complaintsAPI.submit({
                description,
                location,
                ward,
                is_public: isPublic,
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/citizen/track');
            }, 2000);
        } catch (err) {
            const errorMsg = err.message || 'Failed to submit complaint';
            // If auth error, redirect to login
            if (errorMsg.includes('credentials') || errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
                logout();
                router.push('/login?expired=true');
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-3xl mx-auto my-8 p-8 bg-white rounded-lg shadow-md text-center">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Grievance Submitted Successfully!</h2>
                <p className="text-gray-600">Your complaint has been classified and routed to the appropriate department.</p>
                <p className="text-gray-500 mt-2">Redirecting to your complaints...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="text-orange-500" /> Lodge a New Grievance
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe the Issue <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        rows="4"
                        placeholder="E.g., Large pothole at Main Street causing traffic jams. Multiple vehicles have been damaged..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Our AI will automatically detect the category and priority based on your description.
                    </p>
                </div>

                {/* AI Detection Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Activity className="text-blue-600" size={16} />
                        AI Classification {aiLoading && <Loader2 className="animate-spin text-blue-500" size={14} />}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Detected Category</label>
                            <div className="w-full p-3 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 flex items-center justify-between shadow-sm">
                                {aiLoading ? (
                                    <span className="text-gray-400">Analyzing...</span>
                                ) : aiCategory ? (
                                    <>
                                        <span className="text-blue-700">{aiCategory}</span>
                                        <CheckCircle size={16} className="text-green-500" />
                                    </>
                                ) : (
                                    <span className="text-gray-400">Start typing to detect...</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Priority Assessment</label>
                            <div className="w-full p-3 bg-white border border-gray-200 rounded-lg font-semibold flex items-center justify-between shadow-sm">
                                <span className={`${aiPriority === 'High' ? 'text-red-600' :
                                    aiPriority === 'Medium' ? 'text-orange-600' : 'text-blue-600'
                                    }`}>
                                    {aiLoading ? 'Calculating...' : `${aiPriority} Priority`}
                                </span>
                                {aiConfidence > 0 && (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {aiConfidence}% confident
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                            <ImagePlus className="text-gray-400 mb-2" size={32} />
                            <span className="text-sm text-gray-500">Click to upload images (max 3)</span>
                        </label>
                    </div>

                    {images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img.url} alt={`Upload ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location with Auto-detect */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-10 pr-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter exact location or use auto-detect"
                        />
                        <button
                            type="button"
                            onClick={getAutoLocation}
                            disabled={locationLoading}
                            className="absolute right-2 top-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition disabled:opacity-50"
                        >
                            {locationLoading ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : (
                                <Navigation size={14} />
                            )}
                            Auto-detect
                        </button>
                    </div>
                </div>

                {/* Ward */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward / Zone (Optional)</label>
                    <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="E.g., Ward 12, Zone A"
                    />
                </div>

                {/* Public Toggle */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                        Make this complaint visible in community feed (others can upvote to boost priority)
                    </label>
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!description || !location || loading}
                    className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={18} />
                            Submit Grievance
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

