import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-semibold text-sm tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Deep Burgundy with elegant shadow
        default: "bg-primary text-primary-foreground rounded-lg shadow-primary hover:bg-primary-hover active:bg-primary-pressed active:shadow-sm",
        // Secondary - Outlined with burgundy border
        secondary: "bg-transparent border-[1.5px] border-primary text-primary rounded-lg hover:bg-primary/[0.08] active:bg-primary/[0.15]",
        // Ghost/Text button
        ghost: "text-primary hover:underline hover:underline-offset-4 active:opacity-70",
        // Destructive
        destructive: "bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90",
        // Outline with beige border
        outline: "border-[1.5px] border-secondary bg-background text-foreground rounded-lg hover:bg-secondary/20",
        // Premium/Gold variant for special features
        premium: "bg-gradient-to-r from-gold to-[hsl(38,48%,65%)] text-foreground rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        // AI Magic button with pulsing effect
        magic: "bg-gradient-to-r from-primary to-[hsl(352,38%,42%)] text-primary-foreground rounded-full shadow-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        // Soft/Muted variant
        soft: "bg-secondary/30 text-foreground rounded-lg hover:bg-secondary/50",
        // Link style
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] px-8 py-4",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-10 py-4 text-base",
        icon: "h-10 w-10 rounded-lg",
        "icon-lg": "h-14 w-14 rounded-xl",
        // Floating Action Button
        fab: "h-14 w-14 rounded-full shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
