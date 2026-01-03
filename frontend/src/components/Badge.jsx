export default function Badge({ status, size = 'default' }) {
    // Normalize status - handle both uppercase (from backend) and title case
    const normalizeStatus = (s) => {
        if (!s) return 'Pending';
        const statusStr = String(s).toLowerCase().replace(/_/g, ' ');
        return statusStr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const displayStatus = normalizeStatus(status);

    const colors = {
        'Pending': 'bg-red-100 text-red-800 border-red-200',
        'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
        'Resolved': 'bg-green-100 text-green-800 border-green-200',
        'Rejected': 'bg-gray-100 text-gray-800 border-gray-200',
        'Closed': 'bg-gray-100 text-gray-600 border-gray-200',
        'High': 'bg-red-50 text-red-700 border-red-200',
        'Medium': 'bg-orange-50 text-orange-700 border-orange-200',
        'Low': 'bg-blue-50 text-blue-700 border-blue-200',
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
        ${colors[displayStatus] || 'bg-gray-100 text-gray-800 border-gray-200'}
        ${sizeClasses[size]}
      `}
        >
            {displayStatus}
        </span>
    );
}

