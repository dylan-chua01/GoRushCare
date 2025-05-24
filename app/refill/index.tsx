import { Medication, clearMedicationNotification, getMedication, refillMedication } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RefillScreenProps {
  // Add any route params if needed
}

const RefillScreen: React.FC<RefillScreenProps> = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [refillingId, setRefillingId] = useState<string | null>(null);
  const [refillAmount, setRefillAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Animation value for card fade-in
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadMedications();

    // Start fade-in animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const meds = await getMedication();
      // Filter only medications that still need refill
      const needsRefill = meds.filter(med => {
        if (med.refillReminder) {
          if (med.medicationType === 'pill-count') {
            return (med.currentPills ?? 0) <= (med.refillAtPills ?? 0);
          } else {
            return (med.currentDose ?? 0) <= (med.refillAtDose ?? 0);
          }
        }
        return false;
      });
      setMedications(needsRefill);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefill = async (medId: string) => {
    if (!refillAmount || isNaN(parseInt(refillAmount))) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid number for the refill amount',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Find the medication to determine its type
      const medication = medications.find(med => med.id === medId);
      if (!medication) {
        throw new Error('Medication not found');
      }

      const amount = parseInt(refillAmount);
      let success = false;
      
      // Call the appropriate refill method based on medication type
      if (medication.medicationType === 'pill-count') {
        success = await refillMedication(medId, amount, 'pill-count');
      } else {
        success = await refillMedication(medId, amount, 'dose');
      }

      if (success) {
        setRefillingId(null);
        setRefillAmount('');
        await loadMedications();
        Alert.alert(
          'Success',
          'Medication supply has been updated',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Refill error:', error);
      Alert.alert(
        'Error',
        'Failed to update medication supply',
        [{ text: 'OK' }]
      );
    }
  };

  const cancelRefill = () => {
    setRefillingId(null);
    setRefillAmount('');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMedications();
  };

  const handleClearRefill = async (medId: string) => {
    try {
      const success = await clearMedicationNotification(medId);
      if (success) {
        // Filter out the cleared medication from the local state immediately
        setMedications(prevMeds => prevMeds.filter(med => med.id !== medId));
        
        Alert.alert(
          "Success", 
          "Medication refill status cleared",
          [{
            text: "OK",
            onPress: async () => {
              // Force a complete reload of medications
              await loadMedications();
            }
          }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to clear refill status");
      console.error(error);
    }
  };
  // Calculate if we have any medications that need refill
  const needsRefillMeds = medications.filter(med => {
    if (med.medicationType === 'pill-count') {
      return med.currentPills ?? 0 <= med.refillAtPills!;
    } else {
      return med.currentDose ?? 0 <= med.refillAtDose!;
    }
  });
  const hasRefillNeeded = needsRefillMeds.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      

      <Text style={styles.title}>Medications Needing Refill</Text>
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/home')}
        accessibilityLabel="Go back to dashboard"
      >
        <Ionicons name="arrow-back" size={24} color="#0284c7" />
        <Text style={styles.backButtonText}>Dashboard</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.refillNote}>
      1. Please ensure you add medication after you have received your order.
    </Text>
    <Text style={styles.refillNote}>
      2. Please ensure clear the refill notification.
    </Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading medications...</Text>
        </View>
      ) : (
        hasRefillNeeded ? (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#0284c7']}
              />}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {needsRefillMeds.map((med, index) => (
                <View key={med.id} style={[
                  styles.medCard, 
                  { marginBottom: index === needsRefillMeds.length - 1 ? 20 : 12 }
                ]}>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    
                    <Text style={styles.refillAtText}>
                      {med.medicationType === 'pill-count' 
                        ? `Refill threshold: ${med.refillAtPills} pills` 
                        : `Refill threshold: ${med.refillAtDose} mg`}
                    </Text>
                    
                  </View>
                  
                  {refillingId === med.id ? (
  <View style={styles.refillInputContainer}>
    <Text style={styles.refillLabel}>
      {med.medicationType === 'pill-count' ? 'Pills to add:' : 'Dosage (mg) to add:'}
    </Text>
    <TextInput
      style={styles.refillInput}
      placeholder={med.medicationType === 'pill-count' ? "Number of pills" : "Amount in mg"}
      value={refillAmount}
      onChangeText={setRefillAmount}
      keyboardType="numeric"
      autoFocus={true}
      returnKeyType="done"
    />
    <View style={styles.refillButtonsRow}>
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={cancelRefill}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={() => handleRefill(med.id)}
      >
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  </View>
) : (
  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={styles.clearRefillButton}
      onPress={() => handleClearRefill(med.id)}
    >
      <View style={styles.clearButton}>
      <Text>Remove Refill Notice</Text> 
      </View>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.refillButton}
      onPress={() => router.push('/order-form')}
      accessibilityLabel={`Order ${med.name}`}
    >
      <View style={styles.refillButtonContent}>
        <Ionicons name="cart" size={20} color="white" />
        <Text style={styles.refillButtonText}>Order Now</Text>
      </View>
    </TouchableOpacity>
  </View>
)}
                </View>
              ))}
            </Animated.View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4caf50" />
            <Text style={styles.emptyText}>All medications are sufficiently stocked</Text>
    
          </View>
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#0284c7',
  },
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  medCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'column',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  medInfo: {
    marginBottom: 12,
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  supplyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplyIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  supplyEmpty: {
    backgroundColor: '#f44336',
  },
  supplyLow: {
    backgroundColor: '#ff9800',
  },
  supplyText: {
    fontSize: 15,
    color: '#555',
  },
  emptyText: {
    fontWeight: '500',
    color: '#f44336',
  },
  lowText: {
    fontWeight: '500',
    color: '#ff9800',
  },
  refillAtText: {
    fontSize: 14,
    color: '#666',
  },
  refillButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    elevation: 1,
  },
  refillButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  refillInputContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  refillLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  refillInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  refillButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 1,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  viewAllButton: {
    marginTop: 24,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 1,
  },
  viewAllButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  refillButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  refillNote: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 16,
  },
  clearRefillButton: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearButton: {
    backgroundColor: '#e0e7f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    elevation: 1,
  },
  timestampText: {
    fontSize: 12,
    color: '#6b7280', // A muted gray color
    marginTop: 4,
  }
});

export default RefillScreen;