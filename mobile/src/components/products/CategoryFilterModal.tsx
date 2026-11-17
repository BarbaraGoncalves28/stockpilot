import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import type { Category } from "../../modules/categories/category.types";
import { styles } from "./CategoryFilterModal.styles";

type Props = {
  visible: boolean;
  categories: Category[];
  selectedId: number | undefined;
  onSelect: (id: number | undefined) => void;
  onClose: () => void;
};

export function CategoryFilterModal({ visible, categories, selectedId, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Categorias</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.option} onPress={() => onSelect(undefined)}>
            <Text style={styles.optionText}>Todas as categorias</Text>
            {selectedId === undefined && <Ionicons name="checkmark" size={20} color="#00E599" />}
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.option} onPress={() => onSelect(category.id)}>
              <Text style={styles.optionText}>{category.name}</Text>
              {selectedId === category.id && <Ionicons name="checkmark" size={20} color="#00E599" />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}
