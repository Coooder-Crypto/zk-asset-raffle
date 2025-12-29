import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark hover-glow shadow-lg",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25",
        outline:
          "border border-primary/20 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/40",
        secondary:
          "bg-secondary text-white hover:bg-secondary-dark hover:shadow-lg hover:shadow-secondary/25",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark",
        gradient: "gradient-bg text-white hover:shadow-xl hover:shadow-primary/25 hover-lift",
        neon: "bg-transparent border-2 border-primary text-primary neon-text hover:bg-primary hover:text-background hover-glow",
        glass: "glass-effect text-foreground hover:bg-white/10 border border-white/20",
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
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
