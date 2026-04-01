
import * as React from "react";
import { cn } from "@/lib/utils";
import { toast as sonnerToast, type ExternalToast } from 'sonner';

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

type ToastActionElement = React.ReactElement;

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
              }
            : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
    },
  });

  // Also send to sonner
  if (props.variant === "destructive") {
    sonnerToast.error(props.title || "", {
      description: props.description,
    });
  } else {
    sonnerToast(props.title || "", {
      description: props.description,
    });
  }

  return {
    id,
    dismiss,
    update,
  };
}

// Add variants
toast.success = (message: string | ToasterToast) => {
  if (typeof message === 'string') {
    sonnerToast.success(message);
    return toast({
      title: message,
      variant: "default",
    });
  } else {
    sonnerToast.success(message.title || "", {
      description: message.description,
    });
    return toast(message);
  }
};

toast.error = (message: string | ToasterToast) => {
  if (typeof message === 'string') {
    sonnerToast.error(message);
    return toast({
      title: message,
      variant: "destructive",
    });
  } else {
    sonnerToast.error(message.title || "", {
      description: message.description,
    });
    return toast({
      ...message, 
      variant: "destructive"
    });
  }
};

toast.warning = (message: string | ToasterToast) => {
  if (typeof message === 'string') {
    sonnerToast.warning(message);
    return toast({
      title: message,
      variant: "default",
    });
  } else {
    sonnerToast.warning(message.title || "", {
      description: message.description,
    });
    return toast(message);
  }
};

toast.info = (message: string | ToasterToast) => {
  if (typeof message === 'string') {
    sonnerToast.info(message);
    return toast({
      title: message,
      variant: "default",
    });
  } else {
    sonnerToast.info(message.title || "", {
      description: message.description,
    });
    return toast(message);
  }
};

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { toast };
