import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-cocoa text-cream",
        secondary: "border-line bg-cream text-cocoa",
        accent: "border-transparent bg-saffron text-cocoa",
        outline: "text-cocoa border-line",
        ok: "border-transparent bg-ok/15 text-ok",
        err: "border-transparent bg-err/15 text-err",
        warn: "border-transparent bg-warn/15 text-warn",
        info: "border-transparent bg-info/15 text-info",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
