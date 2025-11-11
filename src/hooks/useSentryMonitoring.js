import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

export const useSentryMonitoring = () => {
  const setUser = user => {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  };

  const clearUser = () => {
    Sentry.setUser(null);
  };

  const trackUserAction = (action, metadata = {}) => {
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user',
      level: 'info',
      data: {
        action,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  const trackNavigation = (from, to) => {
    Sentry.addBreadcrumb({
      message: `Navigation: ${from} -> ${to}`,
      category: 'navigation',
      level: 'info',
      data: {
        from,
        to,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const trackWalletOperation = (operation, walletType, success = true, error = null) => {
    Sentry.addBreadcrumb({
      message: `Wallet ${operation}: ${success ? 'success' : 'failed'}`,
      category: 'wallet',
      level: success ? 'info' : 'warning',
      data: {
        operation,
        walletType,
        success,
        error,
        timestamp: new Date().toISOString(),
      },
    });

    if (!success && error) {
      Sentry.captureException(new Error(`Wallet ${operation} failed: ${error}`), {
        tags: {
          wallet_operation: operation,
          wallet_type: walletType,
        },
      });
    }
  };

  const trackFormInteraction = (formName, field, action, value = null) => {
    Sentry.addBreadcrumb({
      message: `Form ${formName}: ${action} ${field}`,
      category: 'form',
      level: 'info',
      data: {
        formName,
        field,
        action,
        value: typeof value === 'string' ? value : null,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const trackValidationError = (formName, field, error) => {
    Sentry.captureMessage(`Validation error in ${formName}`, {
      level: 'warning',
      tags: {
        form_name: formName,
        field,
        error_type: 'validation',
      },
      extra: {
        error,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const trackPerformance = (operation, duration, metadata = {}) => {
    Sentry.addBreadcrumb({
      message: `Performance: ${operation} took ${duration}ms`,
      category: 'performance',
      level: duration > 3000 ? 'warning' : 'info',
      data: {
        operation,
        duration,
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });

    if (duration > 5000) {
      Sentry.captureMessage(`Slow operation: ${operation}`, {
        level: 'warning',
        tags: {
          performance_issue: 'slow_operation',
          operation,
        },
        extra: {
          duration,
          threshold: 5000,
          ...metadata,
        },
      });
    }
  };

  const trackCriticalError = (error, context, metadata = {}) => {
    Sentry.withScope(scope => {
      scope.setLevel('fatal');
      scope.setTag('critical', true);
      scope.setTag('context', context);
      scope.setContext('error_context', {
        context,
        timestamp: new Date().toISOString(),
        ...metadata,
      });

      Sentry.captureException(error);
    });
  };

  useEffect(() => {
    const handleQueryError = event => {
      if (event.detail?.error) {
        Sentry.captureException(event.detail.error, {
          tags: {
            error_type: 'react_query',
            query_key: event.detail.queryKey,
          },
        });
      }
    };

    window.addEventListener('react-query-error', handleQueryError);
    return () => window.removeEventListener('react-query-error', handleQueryError);
  }, []);

  return {
    setUser,
    clearUser,
    trackUserAction,
    trackNavigation,
    trackWalletOperation,
    trackFormInteraction,
    trackValidationError,
    trackPerformance,
    trackCriticalError,
  };
};
