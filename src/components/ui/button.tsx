import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors-taste focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] shadow-sm",
        secondary:
          "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100",
        outline:
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        subtle:
          "bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[#dde6ff] border border-[var(--accent-border)]",
      },
      size: {
        default: "h-8 px-3.5 text-[13px] rounded-xl",
        sm: "h-7 px-2.5 text-[12px] rounded-lg",
        lg: "h-9 px-4 text-[13px] rounded-xl",
        icon: "h-8 w-8 rounded-xl",
        "icon-sm": "h-7 w-7 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
