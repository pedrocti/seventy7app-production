import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  flat?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, flat = false, ...props }, ref) => {
    const base = "rounded-xl text-card-foreground";
    const surface = flat
      ? "bg-card border border-card-border"
      : "bg-gradient-to-b from-card to-card/95 border border-card-border transition-[transform,border-color,box-shadow] duration-200 ease-out [box-shadow:var(--shadow-surface),inset_0_1px_0_0_var(--surface-highlight)]";
    const lift = interactive
      ? "cursor-pointer hover:border-border/40 hover:-translate-y-px hover:[box-shadow:var(--shadow-elevated),inset_0_1px_0_0_var(--surface-highlight)] active:translate-y-0 active:duration-75"
      : "";
    return (
      <div
        ref={ref}
        data-interactive={interactive || undefined}
        className={cn(base, surface, lift, className)}
        {...props}
      />
    );
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-[15px] font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-[12px] text-muted-foreground leading-relaxed", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }