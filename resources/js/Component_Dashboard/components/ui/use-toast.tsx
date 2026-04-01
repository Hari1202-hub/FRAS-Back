
import * as React from "react"

import Toaster from "@/Component_Dashboard/components/ui/toaster"

const Action = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 data-[mode=destructive]:text-destructive-foreground hover:bg-secondary/50 p-1.5"
    {...props}
  />
))
Action.displayName = "Action"

interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  actionAltText?: string
  onDismiss?: () => void
}

let count = 0

const DISMISS_DELAY = 3000

function genId() {
  return `toast-${count++}`
}

interface UseToastOptions {
  duration?: number
}

function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback(
    (props: ToastProps & UseToastOptions) => {
      const id = genId()

      const update = (toast: ToastProps) =>
        setToasts((curr) => curr.map((c) => (c.id === toast.id ? { ...c, ...toast } : c)))

      const dismiss = (toastId: string) => {
        setToasts((curr) => curr.filter((c) => c.id !== toastId))
      }

      const toast = {
        ...props,
        id,
        onDismiss: () => dismiss(id),
      }

      setToasts((v) => [...v, toast])

      if (toast.duration !== null) {
        setTimeout(() => dismiss(id), toast.duration || DISMISS_DELAY)
      }
    },
    [setToasts]
  )

  const updateToast = React.useCallback(
    (toast: ToastProps) => {
      setToasts((curr) => curr.map((c) => (c.id === toast.id ? { ...c, ...toast } : c)))
    },
    [setToasts]
  )

  const dismiss = React.useCallback(
    (toastId: string) => {
      setToasts((curr) => curr.filter((c) => c.id !== toastId))
    },
    [setToasts]
  )

  const removeToast = React.useCallback(
    (toastId: string) => {
      setToasts((curr) => curr.filter((c) => c.id !== toastId))
    },
    [setToasts]
  )

  return {
    toasts,
    addToast,
    updateToast,
    dismiss,
    removeToast,
    Action,
    Toaster,
  }
}

export { useToast }
