import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Variantes oficiais do botao Capivara · brandbook.
 * primary    = bg cocoa + texto cream (acao principal)
 * accent     = bg saffron + texto cocoa (CTA destacado, "Puxar capivara")
 * secondary  = bg cream + borda line (acao secundaria)
 * ghost      = transparente, hover cream (acoes discretas)
 * destructive= bg err + texto cream (deletar, anonimizar)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-[var(--ease-cap)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-cocoa text-cream hover:bg-cocoa-2 shadow-[var(--shadow-card)]",
        accent:
          "bg-saffron text-cocoa hover:brightness-95 shadow-[var(--shadow-card)]",
        secondary:
          "bg-cream text-cocoa border border-line hover:bg-paper",
        ghost:
          "bg-transparent text-cocoa hover:bg-cream",
        destructive:
          "bg-err text-cream hover:brightness-90",
        link:
          "text-cocoa underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
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
