import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  getStepStatus: (step: number) => 'pending' | 'active' | 'completed' | 'disabled';
}

const steps = [
  { number: 1, label: 'Client Info', icon: 'user' },
  { number: 2, label: 'Equipment & Export', icon: 'wrench' },
  { number: 3, label: 'Complete', icon: 'download' }
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick, getStepStatus }) => {
  const getStepIcon = (iconType: string, status: string) => {
    if (status === 'completed') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }

    switch (iconType) {
      case 'user':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'wrench':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M19 5.5a4.5 4.5 0 01-4.791 4.49c-.873-.055-1.808.128-2.368.8l-6.024 7.23a2.724 2.724 0 11-3.837-3.837L9.21 8.16c.672-.56.855-1.495.8-2.368a4.5 4.5 0 015.873-4.575c.324.105.39.51.15.752L13.34 4.66a.455.455 0 00-.11.494 3.01 3.01 0 001.617 1.617c.17.07.363.02.493-.111l2.692-2.692c.242-.24.647-.174.752.15.14.435.216.9.216 1.382z" clipRule="evenodd" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'download':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStepClasses = (step: number) => {
    const status = getStepStatus(step);
    const baseClasses = "flex items-center relative";

    switch (status) {
      case 'completed':
        return `${baseClasses} text-green-600`;
      case 'active':
        return `${baseClasses} text-blue-600`;
      case 'pending':
        return `${baseClasses} text-gray-400 hover:text-gray-600`;
      case 'disabled':
        return `${baseClasses} text-gray-300 cursor-not-allowed`;
      default:
        return `${baseClasses} text-gray-400`;
    }
  };

  const getCircleClasses = (step: number) => {
    const status = getStepStatus(step);
    const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200";

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 border-green-600 text-green-600`;
      case 'active':
        return `${baseClasses} bg-blue-100 border-blue-600 text-blue-600 ring-4 ring-blue-100`;
      case 'pending':
        return `${baseClasses} bg-white border-gray-300 text-gray-400 hover:border-gray-400`;
      case 'disabled':
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-300`;
      default:
        return `${baseClasses} bg-white border-gray-300 text-gray-400`;
    }
  };

  const getConnectorClasses = (step: number) => {
    if (step === steps.length) return 'hidden';

    const status = getStepStatus(step);
    const nextStatus = getStepStatus(step + 1);

    if (status === 'completed') {
      return 'absolute top-5 left-10 w-full h-0.5 bg-green-600';
    } else if (status === 'active' && nextStatus !== 'disabled') {
      return 'absolute top-5 left-10 w-full h-0.5 bg-blue-200';
    } else {
      return 'absolute top-5 left-10 w-full h-0.5 bg-gray-200';
    }
  };

  const handleStepClick = (step: number) => {
    const status = getStepStatus(step);
    if (status !== 'disabled' && onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div key={step.number} className={`${getStepClasses(step.number)} flex-1`}>
              <button
                onClick={() => handleStepClick(step.number)}
                className={`${getCircleClasses(step.number)} ${getStepStatus(step.number) !== 'disabled' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={getStepStatus(step.number) === 'disabled'}
              >
                {getStepIcon(step.icon, getStepStatus(step.number))}
              </button>

              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Step {step.number}
                </p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={getConnectorClasses(step.number)}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;