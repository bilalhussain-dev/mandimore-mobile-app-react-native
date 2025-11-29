import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function FavoritesScreen() {
  const [jsonData, setJsonData] = useState(null);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token:", token);

      if (!token) {
        setJsonData({ error: "No token found!" });
        return;
      }

      const response = await axios.get("https://mandimore.com/v1/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setJsonData(response.data); // ✅ Correct
    } catch (error) {
      setJsonData({
        error: "Failed to load JSON",
        details: error.message,
      });
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <ScrollView style={{ padding: 10 }}>
      <Text style={{ fontFamily: "monospace", fontSize: 14 }}>
        {JSON.stringify(jsonData, null, 2)}
      </Text>
    </ScrollView>
  );
}
