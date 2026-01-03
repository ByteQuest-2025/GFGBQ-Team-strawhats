'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { complaintsAPI } from '@/lib/api';
import { FileText, MapPin, CheckCircle, Activity } from 'lucide-react';

export default function LodgeGrievance() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [ward, setWard] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [aiCategory, setAiCategory] = useState('');
    const [aiPriority, setAiPriority] = useState('Low');
    const [aiConfidence, setAiConfidence] = useState(0);

    const [loading, setLoading] = useState(false);
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
                try {
                    const result = await complaintsAPI.previewAI(description);
                    setAiCategory(result.category);
                    setAiPriority(result.priority);
                    setAiConfidence(result.confidence);
                } catch (err) {
                    // Silently fail for preview
                    console.log('AI preview failed:', err);
                }
            } else {
                setAiCategory('');
                setAiPriority('Low');
                setAiConfidence(0);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [description]);

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
            setError(err.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
    }

    if (success) {
        return (
            <div className="max-w-3xl mx-auto my-8 p-8 bg-white rounded-lg shadow-md text-center">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Grievance Submitted Successfully!</h2>
                <p className="text-gray-600">Redirecting to your complaints...</p>
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
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        rows="4"
                        placeholder="E.g., Large pothole at Main Street causing traffic jams. Multiple vehicles have been damaged..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Our AI will automatically detect the category based on your description.
                    </p>
                </div>

                {/* AI Detection Display */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detected Category</label>
                        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded font-semibold text-gray-700 flex items-center justify-between">
                            {aiCategory || 'Start typing...'}
                            {aiCategory && <CheckCircle size={16} className="text-green-500" />}
                        </div>
                        {aiConfidence > 0 && (
                            <p className="text-xs text-gray-400 mt-1">Confidence: {aiConfidence}%</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AI Priority Assessment</label>
                        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded font-semibold text-gray-700 flex items-center justify-between">
                            <span className={`${aiPriority === 'High' ? 'text-red-600' :
                                    aiPriority === 'Medium' ? 'text-orange-600' : 'text-blue-600'
                                }`}>
                                {aiPriority} Priority
                            </span>
                            <Activity size={16} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Location */}
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
                            className="w-full pl-10 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter exact location (e.g., Near City Mall, MG Road)"
                        />
                    </div>
                </div>

                {/* Ward */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward / Zone (Optional)</label>
                    <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="E.g., Ward 12, Zone A"
                    />
                </div>

                {/* Public Toggle */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                        Make this complaint visible in community feed (others can upvote)
                    </label>
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={!description || !location || loading}
                    className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3 rounded shadow transition"
                >
                    {loading ? 'Submitting...' : 'Submit Grievance'}
                </button>
            </form>
        </div>
    );
}
