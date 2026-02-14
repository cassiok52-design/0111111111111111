import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useSession } from "@/lib/session-provider";

interface AddEarningModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddEarningModal({ visible, onClose }: AddEarningModalProps) {
  const colors = useColors();
  const { addSessionEarning } = useSession();
  const [amount, setAmount] = useState("");

  async function handleAdd() {
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      Alert.alert("Erro", "Insira um valor válido");
      return;
    }

    try {
      await addSessionEarning(value);
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Error adding earning:", error);
      Alert.alert("Erro", "Não foi possível adicionar o ganho");
    }
  }

  function handleClose() {
    setAmount("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl p-6 pb-8">
          <Text className="text-2xl font-bold text-foreground mb-6">Adicionar Ganho</Text>

          {/* Valor do Ganho */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Valor (R$)</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl p-4 text-foreground text-2xl font-bold"
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <Text className="text-xs text-muted mt-2">
              Insira o valor da corrida ou ganho recebido
            </Text>
          </View>

          {/* Botões */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-surface rounded-xl p-4 border border-border"
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-foreground text-center">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-success rounded-xl p-4"
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white text-center">
                Adicionar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
