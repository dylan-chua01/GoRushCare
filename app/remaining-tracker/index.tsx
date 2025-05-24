import { getMedication } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TrackRemainingScreen: React.FC = () => {
  const [medications, setMedications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedications = async () => {
    try {
      const meds = await getMedication();
      setMedications(meds);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    router.push('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0284c7" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Medication Inventory</Text>
      </View>
      
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />}
        contentContainerStyle={styles.scrollContent}
      >
        {medications.length === 0 ? (
          <Text style={styles.emptyText}>No medications added yet.</Text>
        ) : (
          medications.map(med => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.dateText}>
                  Added: {new Date(med.dateAdded || Date.now()).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Text style={styles.detailText}>
                {med.medicationType === 'pill-count'
                  ? `Remaining Pills: ${med.currentPills}`
                  : `Remaining Dosage: ${med.currentDose} mg`}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0284c7',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  medCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 16,
    marginTop: 8,
    color: '#555555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999999',
  },
});

export default TrackRemainingScreen;