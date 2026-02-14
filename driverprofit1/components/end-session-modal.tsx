import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useSession } from "@/lib/session-provider";

interface EndSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EndSessionModal({ visible, onClose }: EndSessionModalProps) {
  const colors = useColors();
  const { activeSession, endSession, isLoading, currentDistance } = useSession();
  const [finalKm, setFinalKm] = useState("");

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDistance(km: number): string {
    return `${km.toFixed(1)} km`;
  }

  function calculateSummary() {
    if (!activeSession) return null;

    const finalKmValue = parseFloat(finalKm);
    const distance = isNaN(finalKmValue) ? currentDistance : finalKmValue - activeSession.initial_km;
    
    // Estimativa de custos (será recalculado no backend)
    const fuelCost = 0; // Será calculado pelo backend
    const maintenanceReserve = 0; // Será calculado pelo backend
    const netProfit = activeSession.gross_revenue; // Estimativa

    return {
      distance,
      grossRevenue: activeSession.gross_revenue,
      fuelCost,
      maintenanceReserve,
      netProfit,
    };
  }

  async function handleEnd() {
    const km = parseFloat(finalKm);

    if (isNaN(km) || km <= 0) {
      Alert.alert("Erro", "Insira um valor válido para o KM final");
      return;
    }

    if (activeSession && km <= activeSession.initial_km) {
      Alert.alert("Erro", "O KM final deve ser maior que o KM inicial");
      return;
    }

    try {
      await endSession(km);
      setFinalKm("");
      onClose();
      Alert.alert("Sucesso", "Turno finalizado com sucesso!");
    } catch (error) {
      console.error("Error ending session:", error);
      Alert.alert("Erro", "Não foi possível finalizar o turno");
    }
  }

  function handleClose() {
    setFinalKm("");
    onClose();
  }

  const summary = calculateSummary();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl p-6 pb-8 max-h-[80%]">
          <Text className="text-2xl font-bold text-foreground mb-6">Finalizar Turno</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* KM Final */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                KM Final (Odômetro)
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl p-4 text-foreground text-base"
                placeholder={activeSession ? `Maior que ${activeSession.initial_km}` : "Ex: 12450"}
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={finalKm}
                onChangeText={setFinalKm}
              />
            </View>

            {/* Resumo do Turno */}
            {summary && (
              <View className="bg-surface rounded-xl p-4 border border-border mb-6">
                <Text className="text-base font-semibold text-foreground mb-4">
                  Resumo do Turno
                </Text>

                <View className="gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Distância Percorrida</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {formatDistance(summary.distance)}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Faturamento Bruto</Text>
                    <Text className="text-sm font-semibold text-success">
                      {formatCurrency(summary.grossRevenue)}
                    </Text>
                  </View>

                  <View className="h-px bg-border" />

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Custo de Combustível</Text>
                    <Text className="text-sm font-semibold text-error">
                      {formatCurrency(summary.fuelCost)}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Reserva de Manutenção</Text>
                    <Text className="text-sm font-semibold text-error">
                      {formatCurrency(summary.maintenanceReserve)}
                    </Text>
                  </View>

                  <View className="h-px bg-border" />

                  <View className="flex-row justify-between">
                    <Text className="text-base font-bold text-foreground">Lucro Líquido</Text>
                    <Text className="text-base font-bold text-success">
                      {formatCurrency(summary.netProfit)}
                    </Text>
                  </View>
                </View>

                <Text className="text-xs text-muted mt-3">
                  * Os custos serão calculados com base nas informações do seu veículo
                </Text>
              </View>
            )}

            {/* Botões */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-surface rounded-xl p-4 border border-border"
                onPress={handleClose}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text className="text-base font-semibold text-foreground text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-error rounded-xl p-4"
                onPress={handleEnd}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-semibold text-white text-center">
                    Finalizar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
