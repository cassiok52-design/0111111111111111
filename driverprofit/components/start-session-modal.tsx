import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useDatabase } from "@/lib/database-provider";
import { useSession } from "@/lib/session-provider";
import { getVehicles, getActiveVehicle, Vehicle } from "@/lib/database";

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StartSessionModal({ visible, onClose }: StartSessionModalProps) {
  const colors = useColors();
  const { currentUser } = useDatabase();
  const { startSession, isLoading } = useSession();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [initialKm, setInitialKm] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");

  useEffect(() => {
    if (visible && currentUser) {
      loadVehicles();
    }
  }, [visible, currentUser]);

  async function loadVehicles() {
    if (!currentUser) return;

    try {
      const vehicleList = await getVehicles(currentUser.id);
      setVehicles(vehicleList);

      if (vehicleList.length > 0) {
        const active = await getActiveVehicle(currentUser.id);
        setSelectedVehicle(active || vehicleList[0]);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
    }
  }

  async function handleStart() {
    if (!selectedVehicle) {
      Alert.alert("Erro", "Selecione um veículo");
      return;
    }

    const km = parseFloat(initialKm);
    const price = parseFloat(fuelPrice);

    if (isNaN(km) || km <= 0) {
      Alert.alert("Erro", "Insira um valor válido para o KM inicial");
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert("Erro", "Insira um valor válido para o preço do combustível");
      return;
    }

    try {
      await startSession(selectedVehicle.id, km, price);
      setInitialKm("");
      setFuelPrice("");
      onClose();
    } catch (error) {
      console.error("Error starting session:", error);
      Alert.alert("Erro", "Não foi possível iniciar o turno. Verifique as permissões de localização.");
    }
  }

  function handleClose() {
    setInitialKm("");
    setFuelPrice("");
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
          <Text className="text-2xl font-bold text-foreground mb-6">Iniciar Turno</Text>

          {vehicles.length === 0 ? (
            <View className="py-8">
              <Text className="text-base text-muted text-center mb-4">
                Você precisa cadastrar um veículo primeiro
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-xl p-4"
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-white text-center">
                  Cadastrar Veículo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Seleção de Veículo */}
              {vehicles.length > 1 && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Veículo</Text>
                  <View className="flex-row gap-2">
                    {vehicles.map((vehicle) => (
                      <TouchableOpacity
                        key={vehicle.id}
                        className={`flex-1 p-3 rounded-lg border ${
                          selectedVehicle?.id === vehicle.id
                            ? "bg-primary/10 border-primary"
                            : "bg-surface border-border"
                        }`}
                        onPress={() => setSelectedVehicle(vehicle)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            selectedVehicle?.id === vehicle.id
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {vehicle.model}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {selectedVehicle && vehicles.length === 1 && (
                <View className="mb-4 p-3 bg-surface rounded-lg border border-border">
                  <Text className="text-sm text-muted">Veículo</Text>
                  <Text className="text-base font-semibold text-foreground mt-1">
                    {selectedVehicle.model}
                  </Text>
                </View>
              )}

              {/* KM Inicial */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">
                  KM Inicial (Odômetro)
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl p-4 text-foreground text-base"
                  placeholder="Ex: 12345"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={initialKm}
                  onChangeText={setInitialKm}
                />
              </View>

              {/* Preço do Combustível */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-foreground mb-2">
                  Preço do Combustível (R$/L)
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl p-4 text-foreground text-base"
                  placeholder="Ex: 5.89"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={fuelPrice}
                  onChangeText={setFuelPrice}
                />
              </View>

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
                  className="flex-1 bg-primary rounded-xl p-4"
                  onPress={handleStart}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-base font-semibold text-white text-center">
                      Iniciar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
