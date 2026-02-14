import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { StatCard } from "@/components/stat-card";
import { useDatabase } from "@/lib/database-provider";
import { useSession } from "@/lib/session-provider";
import { useEffect, useState } from "react";
import { getTodayStats, getDailyGoal } from "@/lib/database";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { StartSessionModal } from "@/components/start-session-modal";
import { AddEarningModal } from "@/components/add-earning-modal";
import { EndSessionModal } from "@/components/end-session-modal";

export default function DashboardScreen() {
  const colors = useColors();
  const { currentUser, isReady } = useDatabase();
  const { activeSession, currentDistance } = useSession();
  const [todayStats, setTodayStats] = useState({
    kmToday: 0,
    grossRevenue: 0,
    netProfit: 0,
    efficiency: 0,
  });
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showAddEarningModal, setShowAddEarningModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    if (isReady && currentUser) {
      loadData();
    }
  }, [isReady, currentUser, activeSession]);

  // Atualizar estatísticas periodicamente quando houver sessão ativa
  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        loadData();
      }, 10000); // Atualizar a cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  async function loadData() {
    if (!currentUser) return;

    try {
      const stats = await getTodayStats(currentUser.id);
      setTodayStats(stats);

      const goal = await getDailyGoal(currentUser.id);
      setDailyGoal(goal?.daily_target_value || null);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDistance(km: number): string {
    return `${km.toFixed(1)} km`;
  }

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }

  function formatDate(): string {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
  }

  function calculateGoalProgress(): number {
    if (!dailyGoal || dailyGoal === 0) return 0;
    return Math.min((todayStats.netProfit / dailyGoal) * 100, 100);
  }

  if (!isReady || isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const goalProgress = calculateGoalProgress();
  const displayKm = activeSession ? currentDistance : todayStats.kmToday;

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground">{getGreeting()}</Text>
          <Text className="text-base text-muted mt-1 capitalize">{formatDate()}</Text>
        </View>

        {/* Cards de Resumo */}
        <View className="px-6 gap-3">
          <View className="flex-row gap-3">
            <StatCard
              title="KM Hoje"
              value={formatDistance(displayKm)}
              icon="location.fill"
              iconColor={colors.primary}
              className="flex-1"
            />
            <StatCard
              title="Faturamento"
              value={formatCurrency(todayStats.grossRevenue)}
              icon="plus.circle.fill"
              iconColor={colors.success}
              className="flex-1"
            />
          </View>

          <View className="flex-row gap-3">
            <StatCard
              title="Lucro Líquido"
              value={formatCurrency(todayStats.netProfit)}
              subtitle={dailyGoal ? `Meta: ${formatCurrency(dailyGoal)}` : undefined}
              icon="chart.bar.fill"
              iconColor={colors.success}
              className="flex-1"
            />
            <StatCard
              title="Eficiência"
              value={formatCurrency(todayStats.efficiency)}
              subtitle="por KM"
              icon="flag.fill"
              iconColor={colors.warning}
              className="flex-1"
            />
          </View>
        </View>

        {/* Progresso da Meta Diária */}
        {dailyGoal && (
          <View className="px-6 mt-6">
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-foreground">Meta Diária</Text>
                <Text className="text-sm font-medium text-primary">
                  {goalProgress.toFixed(0)}%
                </Text>
              </View>

              {/* Barra de Progresso */}
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${goalProgress}%`,
                    backgroundColor: colors.success,
                    height: "100%",
                  }}
                />
              </View>

              <Text className="text-xs text-muted mt-2">
                {goalProgress >= 100
                  ? "🎉 Meta alcançada!"
                  : `Faltam ${formatCurrency(dailyGoal - todayStats.netProfit)} para atingir a meta`}
              </Text>
            </View>
          </View>
        )}

        {/* Status do Turno */}
        {activeSession ? (
          <View className="px-6 mt-6">
            <View className="bg-surface rounded-xl p-4 border border-primary">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-success" />
                  <Text className="text-base font-semibold text-foreground">Turno Ativo</Text>
                </View>
                <TouchableOpacity onPress={() => setShowEndModal(true)}>
                  <Text className="text-sm font-medium text-primary">Finalizar</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-muted">KM Percorridos</Text>
                  <Text className="text-lg font-bold text-foreground mt-1">
                    {formatDistance(currentDistance)}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted">Ganhos do Turno</Text>
                  <Text className="text-lg font-bold text-success mt-1">
                    {formatCurrency(activeSession.gross_revenue)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="px-6 mt-6">
            <TouchableOpacity
              className="bg-primary rounded-xl p-4 flex-row items-center justify-center gap-2"
              activeOpacity={0.8}
              onPress={() => setShowStartModal(true)}
            >
              <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
              <Text className="text-lg font-semibold text-white">Iniciar Turno</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dicas Rápidas */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Dicas Rápidas</Text>
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-sm text-muted">
              💡 Cadastre seu veículo na aba "Veículos" para cálculos precisos de consumo e custos.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modais */}
      <StartSessionModal visible={showStartModal} onClose={() => setShowStartModal(false)} />
      <AddEarningModal visible={showAddEarningModal} onClose={() => setShowAddEarningModal(false)} />
      <EndSessionModal visible={showEndModal} onClose={() => setShowEndModal(false)} />

      {/* Botão Flutuante (FAB) - Apenas quando há turno ativo */}
      {activeSession && (
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            className="w-16 h-16 rounded-full bg-success items-center justify-center shadow-lg"
            activeOpacity={0.8}
            onPress={() => setShowAddEarningModal(true)}
          >
            <IconSymbol name="plus.circle.fill" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
