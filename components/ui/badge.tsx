import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 font-semibold",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 font-semibold",
        outline: "text-foreground font-semibold",
        success:
          "border-transparent bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 font-normal",
        warning:
          "border-transparent bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 font-normal",
        error:
          "border-transparent bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 font-normal",
        info: "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-normal",
        purple:
          "border-transparent bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
