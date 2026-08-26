import * as React from "react"
import { CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-8 w-full appearance-none rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] pl-3 pr-8 text-[13px] font-[450] text-[var(--text-primary)] shadow-sm transition-colors-taste focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <CaretDown
          size={12}
          weight="bold"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
      </div>
    )
  }
)
Select.displayName = "Select"

// Stub primitives for composable API (not functional dropdown, just for demo shell compatibility)
function SelectTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-8 w-full items-center justify-between rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] shadow-sm",
        className
      )}
      {...props}
    >
      {children}
      <CaretDown size={12} weight="bold" className="text-[var(--text-muted)]" />
    </div>
  )
}

function SelectContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-md",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    />
  )
}

export { Select, SelectTrigger, SelectContent, SelectItem }
