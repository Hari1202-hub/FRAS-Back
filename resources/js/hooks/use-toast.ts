
import { toast as sonnerToast, type ExternalToast } from 'sonner';
import * as React from "react";

type ToastProps = {
  title: string;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: React.ReactNode;
};

// Create a function that can be called directly or through methods
const createToastFunction = () => {
  // Base function that handles direct calls
  const toastFunction = (props: string | ToastProps): void => {
    if (typeof props === 'string') {
      sonnerToast(props);
    } else {
      sonnerToast(
        props.title,
        {
          description: props.description,
          duration: props.duration,
          action: props.action,
        }
      );
    }
  };

  // Add methods to the function
  toastFunction.default = (message: React.ReactNode, data?: ExternalToast): void => {
    sonnerToast(message, data);
  };

  toastFunction.success = (message: string | ToastProps): void => {
    if (typeof message === 'string') {
      sonnerToast.success(message);
    } else {
      sonnerToast.success(message.title, {
        description: message.description,
        duration: message.duration,
        action: message.action,
      });
    }
  };

  toastFunction.error = (message: string | ToastProps): void => {
    if (typeof message === 'string') {
      sonnerToast.error(message);
    } else {
      sonnerToast.error(message.title, {
        description: message.description,
        duration: message.duration,
        action: message.action,
      });
    }
  };

  toastFunction.info = (message: string | ToastProps): void => {
    if (typeof message === 'string') {
      sonnerToast.info(message);
    } else {
      sonnerToast.info(message.title, {
        description: message.description,
        duration: message.duration,
        action: message.action,
      });
    }
  };

  toastFunction.warning = (message: string | ToastProps): void => {
    if (typeof message === 'string') {
      sonnerToast.warning(message);
    } else {
      sonnerToast.warning(message.title, {
        description: message.description,
        duration: message.duration,
        action: message.action,
      });
    }
  };

  return toastFunction;
};

// Export the toast function with methods
export const toast = createToastFunction();

// For backwards compatibility with components using the original shadcn structure
export const useToast = () => {
  // Simulate the same interface that was used before
  return {
    toast,
    // Empty array for compatibility with components expecting toasts
    toasts: [],
  };
};
