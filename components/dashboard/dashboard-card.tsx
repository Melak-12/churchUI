import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DivideIcon as LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon?: typeof LucideIcon;
  iconColor?: "blue" | "green" | "red" | "purple" | "orange" | "primary";
  trend?: {
    value: number;
    label: string;
  };
}

export function DashboardCard({
  title,
  description,
  value,
  icon: Icon,
  iconColor = "primary",
  trend,
}: DashboardCardProps) {
  // Define color variants for icon backgrounds with full opacity
  const colorVariants = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    primary: "bg-primary",
  };

  const iconColorVariants = {
    blue: "text-white",
    green: "text-white",
    red: "text-white",
    purple: "text-white",
    orange: "text-white",
    primary: "text-primary-foreground",
  };

  return (
    <Card className='relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-md group'>
      <div className='absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-4 translate-x-4' />
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
        <CardTitle className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
          {title}
        </CardTitle>
        {Icon && (
          <div
            className={`p-2 ${colorVariants[iconColor]} rounded-lg group-hover:scale-110 transition-transform`}
          >
            <Icon className={`h-5 w-5 ${iconColorVariants[iconColor]}`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-bold text-foreground mb-1'>
          {value.toLocaleString()}
        </div>
        {description && (
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {description}
          </p>
        )}
        {trend && (
          <div
            className={`text-xs font-medium mt-2 flex items-center ${
              trend.value > 0
                ? "text-green-600"
                : trend.value < 0
                ? "text-red-600"
                : "text-muted-foreground"
            }`}
          >
            {trend.value > 0 && "↗️ "}
            {trend.value < 0 && "↘️ "}
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
