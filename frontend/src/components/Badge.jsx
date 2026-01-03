export default function Badge({ status, size = 'default' }) {
    // Normalize status - handle both uppercase (from backend) and title case
    const normalizeStatus = (s) => {
        if (!s) return 'Pending';
        const statusStr = String(s).toLowerCase().replace(/_/g, ' ');
        return statusStr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const displayStatus = normalizeStatus(status);

    const colors = {
        'Pending': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
        'In Progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        'Assigned': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Resolved': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
        'Rejected': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
        'Closed': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',
        'High': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        'Medium': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        'Low': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };

    const sizeClasses = {
        small: 'px-1.5 py-0.5 text-[10px]',
        default: 'px-2 py-1 text-xs',
        large: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`
        rounded-full font-medium border inline-block
        ${colors[displayStatus] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'}
        ${sizeClasses[size]}
      `}
        >
            {displayStatus}
        </span>
    );
}
