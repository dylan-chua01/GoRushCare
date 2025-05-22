import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ThankYouScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>🎉 Thank You!</Text>
    <Text style={styles.message}>Your pharmacy order has been received.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#4caf50",
  },
});

export default ThankYouScreen;
