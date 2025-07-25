import * as React from "react"
import { cn } from "@/lib/utils"

interface ModernCardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'gradient' | 'glass' | 'elevated'
  interactive?: boolean
  animated?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = 'default', interactive = false, animated = false, ...props }, ref) => {
    const variants = {
      default: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
      gradient: "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-slate-700/50",
      glass: "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30",
      elevated: "bg-white dark:bg-slate-900 shadow-xl border border-slate-200/50 dark:border-slate-700/50"
    }

    const interactiveClasses = interactive 
      ? "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer transition-all duration-300 ease-out"
      : ""

    const animatedClasses = animated 
      ? "animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
      : ""

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl shadow-sm",
          variants[variant],
          interactiveClasses,
          animatedClasses,
          className
        )}
        {...props}
      />
    )
  }
)
ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
ModernCardHeader.displayName = "ModernCardHeader"

const ModernCardTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
ModernCardTitle.displayName = "ModernCardTitle"

const ModernCardDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  )
)
ModernCardDescription.displayName = "ModernCardDescription"

const ModernCardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
ModernCardContent.displayName = "ModernCardContent"

const ModernCardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
ModernCardFooter.displayName = "ModernCardFooter"

export { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent, ModernCardFooter }
