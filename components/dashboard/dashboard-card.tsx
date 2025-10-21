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

const getIconColorClasses = (color?: string) => {
  switch (color) {
    case "green":
      return "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400";
    case "orange":
      return "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400";
    case "blue":
      return "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400";
    case "purple":
      return "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400";
    case "red":
      return "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function DashboardCard({
  title,
  description,
  value,
  icon: Icon,
  iconColor = "primary",
  trend,
}: DashboardCardProps) {
  return (
    <Card className='border hover:shadow-sm transition-shadow'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg ${getIconColorClasses(iconColor)}`}>
            <Icon className='h-5 w-5' />
          </div>
        )}
      </CardHeader>
      <CardContent className='p-4 sm:p-6 pt-0'>
        <div className='text-2xl font-bold mb-1'>{value.toLocaleString()}</div>
        {description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
