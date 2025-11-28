import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";

export default function FavoritesScreen() {
  const [jsonData, setJsonData] = useState(null);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("https://mandimore.com/v1/favorites");
      const json = await response.json();
      setJsonData(json);
    } catch (error) {
      setJsonData({ error: "Failed to load JSON" });
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
