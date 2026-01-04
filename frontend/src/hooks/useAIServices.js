import { useState, useCallback } from 'react';
import apiRequest from '@/lib/api';

export function useAIServices() {
    const [loading, setLoading] = useState(false);
    const [classification, setClassification] = useState(null);
    const [priorityCheck, setPriorityCheck] = useState(null);
    const [insights, setInsights] = useState([]);

    // Feature 2: Auto-Classification
    const classify = useCallback(async (text) => {
        if (!text || text.length < 10) return;
        setLoading(true);
        try {
            // Using the preview endpoint which returns classification
            const res = await apiRequest(`/api/complaints/preview-ai?description=${encodeURIComponent(text)}`);
            setClassification(res);
            return res;
        } catch (error) {
            console.error("AI Classification Failed:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Feature 3: Priority Verification
    const verifyPriority = useCallback(async (urgency, severity, upvotes = 0) => {
        setLoading(true);
        try {
            const res = await apiRequest(`/api/complaints/verify-priority?urgency=${urgency}&severity=${severity}&upvotes=${upvotes}`, {
                method: 'POST'
            });
            setPriorityCheck(res);
            return res;
        } catch (error) {
            console.error("Priority Check Failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Feature 4: Admin Insights
    const getInsights = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/api/admin/insights/clusters');
            setInsights(res);
            return res;
        } catch (error) {
            console.error("Failed to fetch insights:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        classification,
        priorityCheck,
        insights,
        classify,
        verifyPriority,
        getInsights
    };
}
