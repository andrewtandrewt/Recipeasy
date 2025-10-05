import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto",
  {
    variants: {
      // You can add more variants here if needed
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:outline hover:outline-2 hover:outline-white hover:text-base",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:outline hover:outline-2 hover:outline-white hover:text-base",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:outline hover:outline-2 hover:outline-white hover:text-base",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:outline hover:outline-2 hover:outline-white hover:text-base",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:outline hover:outline-2 hover:outline-white hover:text-base",
        link:
          "text-primary underline-offset-4 hover:underline hover:outline hover:outline-2 hover:outline-white hover:text-base",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants(), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button"

export { Button, buttonVariants }
