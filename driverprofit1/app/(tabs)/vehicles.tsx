import { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useDatabase } from "@/lib/database-provider";
import { useColors } from "@/hooks/use-colors";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  setActiveVehicle,
  Vehicle,
} from "@/lib/database";

export default function VehiclesScreen() {
  const colors = useColors();
  const { currentUser, isReady } = useDatabase();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState("Gasolina");
  const [consumption, setConsumption] = useState("");
  const [maintenancePercent, setMaintenancePercent] = useState("10");

  useEffect(() => {
    if (isReady && currentUser) {
      loadVehicles();
    }
  }, [isReady, currentUser]);

  async function loadVehicles() {
    if (!currentUser) return;
    try {
      const vehicleList = await getVehicles(currentUser.id);
      setVehicles(vehicleList);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function openAddModal() {
    setEditingVehicle(null);
    setModel("");
    setFuelType("Gasolina");
    setConsumption("");
    setMaintenancePercent("10");
    setShowModal(true);
  }

  function openEditModal(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setModel(vehicle.model);
    setFuelType(vehicle.fuel_type);
    setConsumption(vehicle.average_consumption.toString());
    setMaintenancePercent(vehicle.maintenance_percentage.toString());
    setShowModal(true);
  }

  async function handleSave() {
    if (!currentUser) return;
    if (!model.trim()) {
      Alert.alert("Erro", "Insira o modelo do veículo");
      return;
    }
    const consumptionValue = parseFloat(consumption);
    if (isNaN(consumptionValue) || consumptionValue <= 0) {
      Alert.alert("Erro", "Insira um consumo médio válido");
      return;
    }
    const maintenanceValue = parseFloat(maintenancePercent);
    if (isNaN(maintenanceValue) || maintenanceValue < 0 || maintenanceValue > 100) {
      Alert.alert("Erro", "Insira um percentual de manutenção válido (0-100)");
      return;
    }
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, model.trim(), fuelType, consumptionValue, maintenanceValue);
      } else {
        await createVehicle(currentUser.id, model.trim(), fuelType, consumptionValue, maintenanceValue);
      }
      await loadVehicles();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      Alert.alert("Erro", "Não foi possível salvar o veículo");
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    Alert.alert("Confirmar Exclusão", `Deseja realmente excluir o veículo "${vehicle.model}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVehicle(vehicle.id);
            await loadVehicles();
          } catch (error) {
            console.error("Error deleting vehicle:", error);
            Alert.alert("Erro", "Não foi possível excluir o veículo");
          }
        },
      },
    ]);
  }

  async function handleSetActive(vehicle: Vehicle) {
    if (!currentUser) return;
    try {
      await setActiveVehicle(currentUser.id, vehicle.id);
      await loadVehicles();
    } catch (error) {
      console.error("Error setting active vehicle:", error);
      Alert.alert("Erro", "Não foi possível ativar o veículo");
    }
  }

  function renderVehicle({ item }: { item: Vehicle }) {
    return (
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2 flex-1">
            <IconSymbol name="car.fill" size={24} color={colors.primary} />
            <Text className="text-lg font-bold text-foreground flex-1">{item.model}</Text>
            {item.is_active === 1 && (
              <View className="bg-success/20 px-2 py-1 rounded-md">
                <Text className="text-xs font-semibold text-success">Ativo</Text>
              </View>
            )}
          </View>
        </View>
        <View className="gap-2 mb-3">
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Combustível</Text>
            <Text className="text-sm font-medium text-foreground">{item.fuel_type}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Consumo Médio</Text>
            <Text className="text-sm font-medium text-foreground">{item.average_consumption.toFixed(1)} km/L</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Reserva de Manutenção</Text>
            <Text className="text-sm font-medium text-foreground">{item.maintenance_percentage}%</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          {item.is_active === 0 && (
            <TouchableOpacity className="flex-1 bg-primary/10 rounded-lg p-3" onPress={() => handleSetActive(item)} activeOpacity={0.7}>
              <Text className="text-sm font-semibold text-primary text-center">Ativar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity className="flex-1 bg-surface rounded-lg p-3 border border-border" onPress={() => openEditModal(item)} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-foreground text-center">Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-error/10 rounded-lg p-3" onPress={() => handleDelete(item)} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-error text-center">Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isReady || isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Veículos</Text>
        <TouchableOpacity className="bg-primary rounded-full w-12 h-12 items-center justify-center" onPress={openAddModal} activeOpacity={0.8}>
          <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {vehicles.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <IconSymbol name="car.fill" size={64} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">Nenhum veículo cadastrado</Text>
          <Text className="text-sm text-muted mt-2 text-center">Cadastre seu veículo para calcular custos e lucros com precisão</Text>
          <TouchableOpacity className="bg-primary rounded-xl px-6 py-3 mt-6" onPress={openAddModal} activeOpacity={0.8}>
            <Text className="text-base font-semibold text-white">Cadastrar Veículo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={vehicles} renderItem={renderVehicle} keyExtractor={(item) => item.id.toString()} showsVerticalScrollIndicator={false} />
      )}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 pb-8 max-h-[90%]">
            <Text className="text-2xl font-bold text-foreground mb-6">{editingVehicle ? "Editar Veículo" : "Novo Veículo"}</Text>
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Modelo</Text>
              <TextInput className="bg-surface border border-border rounded-xl p-4 text-foreground text-base" placeholder="Ex: Honda Civic 2020" placeholderTextColor={colors.muted} value={model} onChangeText={setModel} />
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Tipo de Combustível</Text>
              <View className="flex-row gap-2 flex-wrap">
                {["Gasolina", "Etanol", "Flex", "Diesel", "GNV"].map((type) => (
                  <TouchableOpacity key={type} className={`px-4 py-3 rounded-lg border ${fuelType === type ? "bg-primary/10 border-primary" : "bg-surface border-border"}`} onPress={() => setFuelType(type)} activeOpacity={0.7}>
                    <Text className={`text-sm font-medium ${fuelType === type ? "text-primary" : "text-foreground"}`}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Consumo Médio (km/L)</Text>
              <TextInput className="bg-surface border border-border rounded-xl p-4 text-foreground text-base" placeholder="Ex: 12.5" placeholderTextColor={colors.muted} keyboardType="decimal-pad" value={consumption} onChangeText={setConsumption} />
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">Reserva de Manutenção (%)</Text>
              <TextInput className="bg-surface border border-border rounded-xl p-4 text-foreground text-base" placeholder="Ex: 10" placeholderTextColor={colors.muted} keyboardType="decimal-pad" value={maintenancePercent} onChangeText={setMaintenancePercent} />
              <Text className="text-xs text-muted mt-2">Percentual do faturamento reservado para manutenção do veículo</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-surface rounded-xl p-4 border border-border" onPress={() => setShowModal(false)} activeOpacity={0.8}>
                <Text className="text-base font-semibold text-foreground text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary rounded-xl p-4" onPress={handleSave} activeOpacity={0.8}>
                <Text className="text-base font-semibold text-white text-center">Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
