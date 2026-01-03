export default function Badge({ status, size = 'default' }) {
    const colors = {
        'Pending': 'bg-red-100 text-red-800 border-red-200',
        'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Resolved': 'bg-green-100 text-green-800 border-green-200',
        'Rejected': 'bg-gray-100 text-gray-800 border-gray-200',
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
        rounded-full font-medium border
        ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}
        ${sizeClasses[size]}
      `}
        >
            {status}
        </span>
    );
}
