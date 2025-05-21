import { DoseHistory, Medication, clearAllData, getDoseHistory, getMedication } from "@/utils/storage";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ----------------------------------------------------- */
/*  Types                                                */
/* ----------------------------------------------------- */

interface EnhancedDoseHistory extends DoseHistory {
  notes: string;
  medName: string;
  medColor?: string;
  medicationId: string;
}

interface Section {
  title: string;
  data: EnhancedDoseHistory[];
}

interface FilterOptions {
  status: 'all' | 'taken';
  medication: string | null;
}

/* ----------------------------------------------------- */
/*  Helpers                                              */
/* ----------------------------------------------------- */

const groupByDate = (history: EnhancedDoseHistory[]): Section[] => {
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 864e5).toDateString();
  
    const grouped = history.reduce(
      (acc: Record<string, EnhancedDoseHistory[]>, dose) => {
        const dateStr = new Date(dose.timestamp).toDateString();
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(dose);
        return acc;
      },
      {}
    );
  
    const sections: Section[] = Object.entries(grouped).map(
      ([dateStr, data]) => {
        let title = dateStr;
        if (dateStr === todayStr) title = "Today";
        else if (dateStr === yesterdayStr) title = "Yesterday";
        else {
          title = new Date(dateStr).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
        return {
          title,
          data: data.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime()
          ),
        };
      }
    );
  
    return sections.sort((a, b) => {
      const getTime = (section: Section) =>
        section.data[0]?.timestamp
          ? new Date(section.data[0].timestamp).getTime()
          : 0;
      return getTime(b) - getTime(a);
    });
  };
  

const enhanceDoseHistory = (history: DoseHistory[], medications: Medication[]): EnhancedDoseHistory[] => {
  return history.map(dose => {
    const med = medications.find(m => m.id === dose.medicationId);
    return {
      ...dose,
      medName: med?.name || 'Unknown Medication',
      medColor: med?.color
    };
  });
};

const getFormattedTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ----------------------------------------------------- */
/*  Screen                                               */
/* ----------------------------------------------------- */

export default function HistoryScreen() {
  const [history, setHistory] = useState<EnhancedDoseHistory[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    medication: null
  });
  
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [historyData, medsData] = await Promise.all([
        getDoseHistory(), 
        getMedication()
      ]);
      
      historyData.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
      
      setMedications(medsData);
      setHistory(enhanceDoseHistory(historyData, medsData));
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load your medication history');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const filteredHistory = useMemo(() => {
    return history.filter((dose) => {
      const medMatch =
        !filters.medication || dose.medicationId === filters.medication;
      const statusMatch =
        filters.status === "all" || (filters.status === "taken" && dose.taken);
      return statusMatch && medMatch;
    });
  }, [history, filters]);

  const sections = useMemo(() => 
    groupByDate(filteredHistory),
  [filteredHistory]);

  const confirmClear = () =>
    Alert.alert("Clear History", "Are you sure you want to clear all dose history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAllData();
            setHistory([]);
          } catch {
            Alert.alert("Error", "Failed to clear history. Please try again.");
          }
        },
      },
    ]);

  const toggleFilter = (type: 'status' | 'medication', value: any) => {
    setFilters(prev => {
      if (type === 'medication' && prev.medication === value) {
        return { ...prev, medication: null };
      }
      if (type === 'status' && prev.status === value) {
        return { ...prev, status: 'all' };
      }
      return { ...prev, [type]: value };
    });
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterSection}>
     
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.chipGroup}>
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              filters.status === 'all' && styles.activeFilterChip
            ]}
            onPress={() => toggleFilter('status', 'all')}
          >
            <Text style={[
              styles.chipText, 
              filters.status === 'all' && styles.activeChipText
            ]}>All</Text>
          </TouchableOpacity>
          
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              filters.status === 'taken' && styles.takenFilterChip
            ]}
            onPress={() => toggleFilter('status', 'taken')}
          >
            <Ionicons 
              name="checkmark-circle" 
              size={14} 
              color={filters.status === 'taken' ? '#16a34a' : '#4b5563'} 
            />
            <Text style={[
              styles.chipText, 
              filters.status === 'taken' && styles.takenChipText
            ]}>Taken</Text>
          </TouchableOpacity>
          
        </View>
      </View>
      
      {medications.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Medication:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.chipGroup}
          >
            {medications.map(med => (
              <TouchableOpacity 
                key={med.id}
                style={[
                  styles.filterChip, 
                  filters.medication === med.id && styles.activeFilterChip,
                  med.color ? { backgroundColor: `${med.color}20` } : undefined
                ]}
                onPress={() => toggleFilter('medication', med.id)}
              >
                <View 
                  style={[
                    styles.medColorDot,
                    { backgroundColor: med.color || '#9ca3af' }
                  ]} 
                />
                <Text style={[
                  styles.chipText,
                  filters.medication === med.id && styles.activeChipText
                ]}>{med.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading your medication history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          title: 'Dose History',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#f8fafc' },
          headerLeft: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Ionicons name="arrow-back" size={22} color="#0284c7" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/home')}
                style={styles.headerButton}
              >
                <Ionicons name="home-outline" size={22} color="#0284c7" />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={confirmClear} 
              style={styles.headerButton}
              disabled={history.length === 0}
            >
              <Ionicons 
                name="trash-outline" 
                size={22} 
                color={history.length ? "#e11d48" : "#9ca3af"} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Back button for mobile view */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <Ionicons name="arrow-back" size={20} color="#0284c7" />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#f8fafc', '#e0f2fe']}
        style={styles.gradientBackground}
      >
        {renderFilterChips()}

        <SectionList
          sections={sections}
          keyExtractor={(item: EnhancedDoseHistory) => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0284c7"
            />
          }
          contentContainerStyle={history.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>
                No dose history found
              </Text>
              <Text style={styles.emptyStateMessage}>
                {filters.status !== 'all' || filters.medication 
                  ? "Try changing your filters or add new doses"
                  : "Start tracking your medication by adding doses"}
              </Text>
              {filters.status === 'all' && !filters.medication && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => router.push('/medications/add')}
                >
                  <Text style={styles.addButtonText}>Add Medication</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <View style={styles.medInfo}>
                  <View 
                    style={[
                      styles.medColorIndicator,
                      { backgroundColor: item.medColor || '#9ca3af' }
                    ]} 
                  />
                  <Text style={styles.medName}>{item.medName}</Text>
                </View>
              </View>
              
              <View style={styles.timestampContainer}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text style={styles.timestamp}>
                  {getFormattedTime(item.timestamp)}
                </Text>
                
                {item.notes && (
                  <View style={styles.notesContainer}>
                    <Ionicons name="document-text-outline" size={14} color="#6b7280" />
                    <Text style={styles.notes} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.title}
              </Text>
              <Text style={styles.sectionCount}>
                {section.data.length} {section.data.length === 1 ? 'dose' : 'doses'}
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled={true}
        />
      </LinearGradient>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', // Match with gradient start color
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  gradientBackground: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0284c7',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterSection: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  activeFilterChip: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  takenFilterChip: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  skippedFilterChip: {
    backgroundColor: '#fee2e2',
    borderColor: '#e11d48',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
  },
  activeChipText: {
    color: '#0284c7',
    fontWeight: '500',
  },
  takenChipText: {
    color: '#16a34a',
    fontWeight: '500',
  },
  skippedChipText: {
    color: '#e11d48',
    fontWeight: '500',
  },
  medColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
  },
  emptyStateMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 250,
  },
  addButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0284c7',
    borderRadius: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  listItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  medName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  takenBadge: {
    backgroundColor: '#dcfce7',
  },
  skippedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    marginRight: 12,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  notes: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  // New styles for back button
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#0284c7',
  },
});