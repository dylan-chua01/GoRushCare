import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ThankYouScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>🎉 Thank You!</Text>
    <Text style={styles.message}>Your pharmacy order has been received.</Text>
    <TouchableOpacity
    style={{
      backgroundColor: '#007bff',
      paddingVertical: 14,
      paddingHorizontal: 25,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    }}
    onPress={() => router.push('/home')}
  >
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Back to Dashboard</Text>
  </TouchableOpacity>
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
function handleSubmit(onSubmit: any): ((event: import("react-native").GestureResponderEvent) => void) | undefined {
  throw new Error("Function not implemented.");
}

