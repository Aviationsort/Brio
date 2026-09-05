/**
 * Error State UI Components for common failure scenarios
 */

import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Lock, HardDrive, ShieldAlert } from 'lucide-react';
import type { ErrorCategory } from '../../types';

export interface ErrorStateProps {
  category: ErrorCategory;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const categoryConfig: Record<ErrorCategory, { icon: typeof AlertTriangle; defaultTitle: string; defaultDescription: string }> = {
  network: {
    icon: WifiOff,
    defaultTitle: 'Connection Lost',
    defaultDescription: 'Unable to reach the server. Please check your internet connection.',
  },
  auth: {
    icon: Lock,
    defaultTitle: 'Authentication Required',
    defaultDescription: 'Your session has expired. Please sign in to continue.',
  },
  crypto: {
    icon: ShieldAlert,
    defaultTitle: 'Encryption Error',
    defaultDescription: 'A security operation failed. Your data remains protected.',
  },
  storage: {
    icon: HardDrive,
    defaultTitle: 'Storage Error',
    defaultDescription: 'Could not access your vault. Please check available space.',
  },
  validation: {
    icon: AlertTriangle,
    defaultTitle: 'Invalid Input',
    defaultDescription: 'Some information was not recognized. Please review and try again.',
  },
  unknown: {
    icon: AlertTriangle,
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'An unexpected error occurred. Please try again later.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  category,
  title,
  description,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="p-3 rounded-full bg-red-950/60 border border-red-800/40 mb-4">
        <Icon className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-red-100 mb-1">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-red-300/80 max-w-sm mb-4">
        {description || config.defaultDescription}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="skeuo-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-800/60 border border-red-700/40 text-red-100 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  retryLabel = 'Retry',
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-red-800/40 bg-red-950/60 ${className}`}>
      <div className="flex items-center gap-2 text-red-200">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="skeuo-btn-primary shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-900/50 hover:bg-red-800/50 border border-red-700/30 text-red-100 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing Here Yet',
  description = 'This section is empty. Start by adding something.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="p-3 rounded-full bg-red-950/40 border border-red-900/30 mb-4">
        <HardDrive className="w-6 h-6 text-red-400/70" />
      </div>
      <h3 className="text-base font-medium text-red-200 mb-1">{title}</h3>
      <p className="text-sm text-red-300/70 max-w-xs mb-4">{description}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="skeuo-btn-primary px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 border border-red-700/30 text-red-100 text-sm font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
