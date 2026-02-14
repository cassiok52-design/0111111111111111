import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { PeriodFilter, getDateRangeForPeriod } from '@/components/period-filter';
import { SessionCard } from '@/components/session-card';
import { useDatabase } from '@/lib/database-provider';
import { getCompletedSessions, getSessionStatistics, WorkSession } from '@/lib/database';
import { useColors } from '@/hooks/use-colors';

export default function HistoryScreen() {
  const colors = useColors();
  const { currentUser } = useDatabase();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalSessions: number;
    totalDistance: number;
    totalGrossRevenue: number;
    totalNetProfit: number;
    averageEfficiency: number;
  }>({
    totalSessions: 0,
    totalDistance: 0,
    totalGrossRevenue: 0,
    totalNetProfit: 0,
    averageEfficiency: 0,
  });

  // Carregar dados quando período muda
  useEffect(() => {
    if (currentUser) {
      loadHistory();
    }
  }, [period, currentUser]);

  async function loadHistory() {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRangeForPeriod(period);
      
      // Carregar sessões
      const completedSessions = await getCompletedSessions(
        currentUser.id,
        startDate,
        endDate
      );
      setSessions(completedSessions);

      // Carregar estatísticas
      const statistics = await getSessionStatistics(
        currentUser.id,
        startDate,
        endDate
      );
      setStats({
        totalSessions: statistics.totalSessions,
        totalDistance: statistics.totalDistance,
        totalGrossRevenue: statistics.totalGrossRevenue,
        totalNetProfit: statistics.totalNetProfit,
        averageEfficiency: statistics.averageEfficiency,
      });
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Histórico</Text>
        <Text className="text-sm text-muted">Seus turnos de trabalho</Text>
      </View>

      {/* Period Filter */}
      <PeriodFilter selectedPeriod={period} onPeriodChange={setPeriod} />

      {/* Statistics Cards */}
      <View className="px-4 py-3 gap-3">
        <View className="flex-row gap-3">
          {/* Total Sessions */}
          <View
            className="flex-1 p-3 rounded-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted mb-1">Turnos</Text>
            <Text className="text-lg font-bold text-foreground">
              {stats.totalSessions}
            </Text>
          </View>

          {/* Total Distance */}
          <View
            className="flex-1 p-3 rounded-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted mb-1">KM Total</Text>
            <Text className="text-lg font-bold text-foreground">
              {stats.totalDistance.toFixed(1)}
            </Text>
          </View>

          {/* Average Efficiency */}
          <View
            className="flex-1 p-3 rounded-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted mb-1">Eficiência</Text>
            <Text className="text-lg font-bold text-foreground">
              R$ {stats.averageEfficiency.toFixed(2)}/km
            </Text>
          </View>
        </View>

        {/* Total Revenue */}
        <View
          className="p-3 rounded-lg flex-row justify-between items-center"
          style={{ backgroundColor: colors.surface }}
        >
          <View>
            <Text className="text-xs text-muted mb-1">Faturamento Bruto</Text>
            <Text className="text-lg font-bold text-foreground">
              R$ {stats.totalGrossRevenue.toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted mb-1">Lucro Líquido</Text>
            <Text
              className="text-lg font-bold"
              style={{
                color: stats.totalNetProfit >= 0 ? colors.success : colors.error,
              }}
            >
              R$ {stats.totalNetProfit.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Sessions List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sessions.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-center text-muted text-base">
            Nenhum turno encontrado para este período
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={({ item }) => <SessionCard session={item} />}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={true}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListFooterComponent={<View className="h-4" />}
        />
      )}
    </ScreenContainer>
  );
}
