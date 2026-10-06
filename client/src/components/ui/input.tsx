import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md text-sm",
          "bg-input border border-border/80",
          "px-3.5 py-2 text-foreground placeholder:text-muted-foreground/70",
          "shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.04)]",
          "transition-[border-color,box-shadow,background-color] duration-150",
          "hover:border-border",
          "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-input/80",
          "focus-visible:ring-[3px] focus-visible:ring-primary/15",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
