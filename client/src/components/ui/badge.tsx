import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "bg-primary/10  text-primary  border-primary/20",
        secondary:   "bg-muted        text-foreground/80 border-border/60",
        outline:     "bg-transparent  text-foreground border-border",
        success:     "bg-success/10  text-success  border-success/25",
        warning:     "bg-warning/12  text-warning  border-warning/25",
        danger:      "bg-danger/10   text-danger   border-danger/25",
        destructive: "bg-danger/10   text-danger   border-danger/25",
        info:        "bg-info/10     text-info     border-info/25",
        muted:       "bg-muted        text-muted-foreground border-border/50",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
