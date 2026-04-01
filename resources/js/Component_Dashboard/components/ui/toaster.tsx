
import * as React from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/Component_Dashboard/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ ...props }) {
        return (
          <Toast key={props.id} {...props}>
            <div className="grid gap-1 pr-7">
              {props.title && <ToastTitle>{props.title}</ToastTitle>}
              {props.description && (
                <ToastDescription>{props.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

export default Toaster
