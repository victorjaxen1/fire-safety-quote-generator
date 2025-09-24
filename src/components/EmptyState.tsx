import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon: 'user' | 'wrench' | 'document' | 'clipboard' | 'exclamation';
  title: string;
  description: string;
  actions?: EmptyStateAction[];
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actions = [] }) => {
  const getIcon = () => {
    const iconClasses = "w-12 h-12 text-gray-400 mb-4";

    switch (icon) {
      case 'user':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M24 12c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7zM12 35c0-6.627 5.373-12 12-12s12 5.373 12 12" />
          </svg>
        );
      case 'wrench':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 15l3.5-3.5a9 9 0 1112.73 0L37 21.75a2.25 2.25 0 01-3.18 3.18L24 15" />
          </svg>
        );
      case 'document':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6l3 3h15a3 3 0 013 3v12a3 3 0 01-3 3H9a3 3 0 01-3-3V15a3 3 0 013-3z" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 8h18a3 3 0 013 3v24a3 3 0 01-3 3H15a3 3 0 01-3-3V11a3 3 0 013-3zM21 4h6v4H21V4z" />
          </svg>
        );
      case 'exclamation':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m3 0a9 9 0 019 9v0a9 9 0 01-9-9z" />
            <circle cx="24" cy="24" r="12" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M24 16v8m0 4h.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getActionButtonClasses = (variant: 'primary' | 'secondary') => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2";

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="text-center py-12 px-6">
      <div className="flex flex-col items-center">
        {getIcon()}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-sm">{description}</p>

        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={getActionButtonClasses(action.variant || 'primary')}
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;