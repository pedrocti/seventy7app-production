import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "border border-primary-border",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_-4px_hsl(var(--primary)/0.4)]",
          "hover:brightness-110",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.25),0_8px_20px_-4px_hsl(var(--primary)/0.5)]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "border border-destructive-border",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_-4px_hsl(var(--destructive)/0.4)]",
          "hover:brightness-110",
        ].join(" "),
        outline: [
          "border border-[hsl(var(--border))] bg-transparent text-foreground",
          "shadow-[inset_0_1px_0_0_var(--surface-highlight)]",
          "hover:bg-muted/50 hover:border-[hsl(var(--border)/1.5)]",
          "active:bg-muted/70",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground border border-secondary-border",
          "shadow-[inset_0_1px_0_0_var(--surface-highlight)]",
          "hover:bg-[hsl(var(--secondary)/1.4)]",
        ].join(" "),
        ghost: [
          "text-foreground/80 border border-transparent",
          "hover:bg-muted/60 hover:text-foreground",
          "active:bg-muted/80",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-10 rounded-lg px-6 text-[15px]",
        xl:      "h-12 rounded-lg px-7 text-[15px]",
        icon:    "h-9 w-9",
        "icon-sm": "h-8 w-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
