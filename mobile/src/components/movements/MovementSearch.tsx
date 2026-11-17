import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { styles } from "./MovementSearch.styles";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSearch: () => void;
};

export default function MovementSearch({ value, onChangeText, onSearch }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={21} color="#8B9BB4" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          placeholder="Buscar por nome do produto, código ou motivo..."
          placeholderTextColor="#8B9BB4"
          returnKeyType="search"
          style={styles.input}
        />
      </View>
      <Pressable onPress={onSearch} style={styles.button}>
        <Ionicons name="search-outline" size={22} color="#050B14" />
        <Text style={styles.buttonText}>Buscar</Text>
      </Pressable>
    </View>
  );
}
