import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md text-sm leading-relaxed",
        "bg-input border border-border/80",
        "px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/70",
        "shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.04)]",
        "transition-[border-color,box-shadow,background-color] duration-150",
        "hover:border-border",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-input/80",
        "focus-visible:ring-[3px] focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
