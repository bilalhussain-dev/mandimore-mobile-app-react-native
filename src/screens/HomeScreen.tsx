import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import CreateOrEditProductModal, {
  ProductFormData,
} from "./../components/createOrEditProductModal";

const HomeScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = (form: ProductFormData) => {
    console.log("Form submitted:", form);
    // TODO: Call your API here
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.floatingButton}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Popup Modal */}
      <CreateOrEditProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#f1641e",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
});
