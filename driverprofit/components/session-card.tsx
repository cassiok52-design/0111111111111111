import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { WorkSession } from '@/lib/database';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: WorkSession;
  onPress?: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const colors = useColors();

  // Formatar data
  const startDate = new Date(session.start_date);
  const endDate = session.end_date ? new Date(session.end_date) : null;
  
  const dateStr = startDate.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  
  const timeStr = startDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calcular duração
  let durationStr = 'Em andamento';
  if (endDate) {
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    durationStr = `${hours}h ${minutes}m`;
  }

  // Determinar cor de lucro
  const isPositive = session.net_profit >= 0;
  const profitColor = isPositive ? colors.success : colors.error;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        className="mx-4 mb-3 p-4 rounded-lg border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        {/* Header: Data e Hora */}
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-sm font-semibold text-foreground">{dateStr}</Text>
            <Text className="text-xs text-muted">{timeStr}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted">{durationStr}</Text>
          </View>
        </View>

        {/* Divider */}
        <View
          className="h-px mb-3"
          style={{ backgroundColor: colors.border }}
        />

        {/* Stats Grid */}
        <View className="flex-row gap-2">
          {/* KM */}
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">KM</Text>
            <Text className="text-sm font-semibold text-foreground">
              {session.distance_traveled.toFixed(1)} km
            </Text>
          </View>

          {/* Faturamento */}
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Bruto</Text>
            <Text className="text-sm font-semibold text-foreground">
              R$ {session.gross_revenue.toFixed(2)}
            </Text>
          </View>

          {/* Custo Combustível */}
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Combustível</Text>
            <Text className="text-sm font-semibold text-foreground">
              R$ {session.fuel_cost.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          className="h-px my-3"
          style={{ backgroundColor: colors.border }}
        />

        {/* Bottom Row: Lucro Líquido e Eficiência */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-muted mb-1">Lucro Líquido</Text>
            <Text
              className="text-base font-bold"
              style={{ color: profitColor }}
            >
              R$ {session.net_profit.toFixed(2)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-xs text-muted mb-1">Eficiência</Text>
            <Text className="text-sm font-semibold text-foreground">
              R$ {(session.distance_traveled > 0 ? session.gross_revenue / session.distance_traveled : 0).toFixed(2)}/km
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
