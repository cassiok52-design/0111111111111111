import { View, Text } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "#0A84FF",
  className,
}: StatCardProps) {
  return (
    <View className={cn("bg-surface rounded-xl p-4 border border-border", className)}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-muted font-medium">{title}</Text>
        <IconSymbol name={icon as any} size={20} color={iconColor} />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-1">{value}</Text>
      {subtitle && <Text className="text-xs text-muted">{subtitle}</Text>}
    </View>
  );
}
