import { Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function ProfileScreen() {
  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-foreground">Perfil</Text>
        <Text className="text-base text-muted mt-2">Em desenvolvimento</Text>
      </View>
    </ScreenContainer>
  );
}
