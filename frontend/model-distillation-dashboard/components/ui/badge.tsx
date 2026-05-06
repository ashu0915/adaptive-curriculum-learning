import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        destructive:
          "border-transparent bg-red-500/10 text-red-900 hover:bg-red-500/20 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30",
        outline: "text-slate-950 dark:text-slate-50",
        success:
          "border-transparent bg-green-500/10 text-green-900 hover:bg-green-500/20 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30",
        warning:
          "border-transparent bg-yellow-500/10 text-yellow-900 hover:bg-yellow-500/20 dark:border-yellow-800/50 dark:bg-yellow-900/20 dark:text-yellow-200 dark:hover:bg-yellow-900/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
