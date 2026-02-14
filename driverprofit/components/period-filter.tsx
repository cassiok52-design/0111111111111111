import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';

interface PeriodFilterProps {
  selectedPeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
}

export function PeriodFilter({ selectedPeriod, onPeriodChange }: PeriodFilterProps) {
  const colors = useColors();

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'all', label: 'Tudo' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-3"
      contentContainerStyle={{ gap: 8 }}
    >
      {periods.map((period) => (
        <Pressable
          key={period.id}
          onPress={() => onPeriodChange(period.id)}
          style={({ pressed }) => [
            {
              backgroundColor:
                selectedPeriod === period.id
                  ? colors.primary
                  : colors.surface,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            className={cn(
              'font-semibold text-sm',
              selectedPeriod === period.id
                ? 'text-background'
                : 'text-foreground'
            )}
          >
            {period.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/**
 * Formata data para YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula as datas de início e fim baseado no filtro de período
 */
export function getDateRangeForPeriod(period: PeriodFilter): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date;
  let endDate: Date = new Date(today);

  switch (period) {
    case 'today':
      startDate = new Date(today);
      break;
    case 'week':
      // Começar de segunda-feira
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - daysToMonday);
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'all':
      startDate = new Date('2000-01-01');
      break;
    default:
      startDate = new Date(today);
  }

  const result = {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };

  console.log('[getDateRangeForPeriod]', { period, ...result });
  return result;
}
