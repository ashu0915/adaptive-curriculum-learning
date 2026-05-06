import React from "react"
import { Toaster, toast } from "sonner"

export { toast, Toaster }

export function useToast() {
  return { toast }
}
