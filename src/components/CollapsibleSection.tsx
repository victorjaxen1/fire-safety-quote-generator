import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  step: number;
  currentStep: number;
  isCompleted: boolean;
  completionSummary?: string;
  children: React.ReactNode;
  alwaysShowWhenActive?: boolean;
  stepStatus: 'pending' | 'active' | 'completed' | 'disabled';
  onEdit?: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  step,
  currentStep,
  isCompleted,
  completionSummary,
  children,
  alwaysShowWhenActive = true,
  stepStatus,
  onEdit
}) => {
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  // Determine if section should be expanded
  const shouldShowExpanded = () => {
    // Always show active step
    if (currentStep === step && alwaysShowWhenActive) return true;

    // Show if manually expanded
    if (isManuallyExpanded) return true;

    // Show if not completed yet
    if (!isCompleted && stepStatus !== 'disabled') return true;

    return false;
  };

  // Determine if section should show collapsed summary
  const shouldShowCollapsed = () => {
    return isCompleted && currentStep > step && !isManuallyExpanded;
  };

  const getHeaderClasses = () => {
    const baseClasses = "flex items-center justify-between p-4";

    switch (stepStatus) {
      case 'active':
        return `${baseClasses} bg-blue-50 border-l-4 border-blue-500`;
      case 'completed':
        return `${baseClasses} bg-green-50 border-l-4 border-green-500`;
      case 'disabled':
        return `${baseClasses} bg-gray-50 border-l-4 border-gray-300`;
      default:
        return `${baseClasses} bg-gray-50 border-l-4 border-gray-300`;
    }
  };

  const getStatusIcon = () => {
    switch (stepStatus) {
      case 'completed':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'active':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        );
      case 'pending':
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        );
    }
  };

  const handleToggleExpand = () => {
    setIsManuallyExpanded(!isManuallyExpanded);
    if (onEdit) onEdit();
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 transition-all duration-200">
      {/* Section Header */}
      <div className={getHeaderClasses()}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {shouldShowCollapsed() && completionSummary && (
              <p className="text-sm text-gray-600 mt-1">{completionSummary}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Step indicator */}
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Step {step}
          </span>

          {/* Edit/Expand button for completed sections */}
          {shouldShowCollapsed() && (
            <button
              onClick={handleToggleExpand}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Edit</span>
            </button>
          )}

          {/* Collapse button for expanded completed sections */}
          {isManuallyExpanded && isCompleted && (
            <button
              onClick={() => setIsManuallyExpanded(false)}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Collapse</span>
            </button>
          )}
        </div>
      </div>

      {/* Section Content */}
      {shouldShowExpanded() && (
        <div className="p-6 border-t border-gray-100 transition-all duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;