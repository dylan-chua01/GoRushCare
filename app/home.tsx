import Footer from "@/components/footer";
import { cancelMedicationReminders, registerForPushNotificationsAsync, scheduleMedicationReminder } from "@/utils/notifications";
import { DoseHistory, Medication, clearMedicationNotification, deleteMedication, getMedication, getTodaysDoses, recordDose } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    AppState,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get('window')
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const QUICK_ACTIONS = [
    {
        label: "Add \nMedication",
        icon: "add-circle-outline" as const,
        route: '/medications/add' as const,
        color: '#2e7d32',
        gradient: ["#4caf50", "#2e7d32"] as [string, string],
    },
    {
        icon: "calendar-outline" as const,
        label: "Calendar\nView",
        route: "/calendar" as const,
        color: "#1976d2",
        gradient: ['#2196f3', '#1976d2'] as [string, string],
    },
    {
        icon: "time-outline" as const,
        label: "History\nLog",
        route: "/history" as const,
        color: "#c2185b",
        gradient: ["#e91e63", "#c2185b"] as [string, string],
    },
    {
        icon: "medical-outline" as const,
        label: "Refill\nTracker",
        route: "/refill" as const,
        color: "#e64a19",
        gradient: ["#ff5722", "#e64a19"] as [string, string],
    },
    {
        icon: "cart-outline" as const,
        label: "Order\nMedication",
        route: "/order-form" as const,
        color: "#5D4037",
        gradient: ["#8D6E63", "#5D4037"] as [string, string],
      },
      {
        icon: "help-circle-outline" as const,
        label: "Pharmacy\nFAQ",
        route: "/faq" as const,
        color: "#1565C0",
        gradient: ["#42A5F5", "#1565C0"] as [string, string],
      },
      {
        icon: "analytics-outline" as const,
        label: "Status\nTracker",
        route: "/remaining-tracker" as const,
        color: "#00695C",
        gradient: ["#26A69A", "#00695C"] as [string, string],
      },
      {
        icon: "chatbubble-ellipses-outline" as const,
        label: "Quick\nHelp",
        route: "https://www.chatbase.co/chatbot-iframe/n-miXqjuhoM3URyV-eEgN" as const,
        color: "#004D40",
        gradient: ["#7E57C2", "#5E35B1"] as [string, string],
      }
]

interface CircularProgressProps{
    progress: number;
    totalDoses: number;
    completedDoses: number;
}

function CircularProgress({
    progress,
    totalDoses,
    completedDoses,
}: CircularProgressProps) {
    const animationValue = useRef(new Animated.Value(0)).current;
    const size = width * 0.55
    const strokeWidth = 15
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    useEffect(() => {
        Animated.timing(animationValue, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [progress]);

    const strokeDashoffset = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
                <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.progressLabel}>{" "} {completedDoses} of {totalDoses} doses</Text>
            </View>
            <Svg width={size} height={size} style={styles.progressRing}>
                <Circle 
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <AnimatedCircle 
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
        </View>
    )
}


export default function HomeScreen() {

    const router = useRouter();
    const [todaysMedications, setTodaysMedications] = useState<Medication[]>([]);
    const [completedDoses, setCompletedDoses] = useState(0);
    const [totalDoses, setTotalDoses] = useState(0);
    const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [medToDelete, setMedToDelete] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [needsRefill, setNeedsRefill] = useState(0);
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Time to refill your meds!', read: false },
        { id: 2, message: 'New prescription added.', read: false },
      ]);

    const loadMedications = useCallback(async () =>{
        try {
            const [allMedications, todaysDoses] = await Promise.all([
                getMedication(),
                getTodaysDoses(),

                
            ]);

             // Reset both states to ensure clean update
            setMedications(allMedications);
            setDoseHistory(todaysDoses);

            // Calculate medications needing refill
            const refillCount = allMedications.filter(med => 
                med.refillReminder && med.currentSupply <= med.refillAt
            ).length;
            setNeedsRefill(refillCount);

            const today = new Date();

            const todayMeds = allMedications.filter((med)=> {
                const startDate = new Date(med.startDate);
            startDate.setHours(0, 0, 0, 0);
                const durationDays = med.duration === "Ongoing" ? 
                Infinity : 
                parseInt(med.duration.split(" ")[0]);

                if(
                    durationDays === -1 || (today >= startDate && today <= new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000))
                ) {
                    return true;
                }
                return false;
            });


            setTodaysMedications(todayMeds);
            
            // Calculate total doses based on the medications for today
            let totalDosesCount = 0;
            todayMeds.forEach(med => {
                // Count doses based on the number of times per day
                totalDosesCount += med.times.length;
            });
            setTotalDoses(totalDosesCount);
            
            const completed = todaysDoses.filter((dose) => dose.taken).length;
            setCompletedDoses(completed);
        } catch (error) {
            console.log("Error loading medications:", error);
        }
    }, [])

    const handleDeleteMedication = async () => {
        if (!medToDelete) return;
        
        try {
          // Delete from storage (including dose history)
          const success = await deleteMedication(medToDelete);
          
          if (success) {
            // Update all relevant states
            setMedications(prev => prev.filter(m => m.id !== medToDelete));
            setTodaysMedications(prev => prev.filter(m => m.id !== medToDelete));
            setDoseHistory(prev => prev.filter(d => d.medicationId !== medToDelete));
            
            // Recalculate counts
            const updatedCompletedDoses = doseHistory.filter(
              d => d.medicationId !== medToDelete && d.taken
            ).length;
            setCompletedDoses(updatedCompletedDoses);
            
            const updatedTotalDoses = todaysMedications
              .filter(m => m.id !== medToDelete)
              .reduce((total, med) => total + med.times.length, 0);
            setTotalDoses(updatedTotalDoses);
            
            // Force refresh the calendar screen
            router.push({
              pathname: '/calendar',
              params: { refresh: Date.now() }
            });
            
            Alert.alert("Success", "Medication deleted successfully");
          }
        } catch (error) {
          console.error("Delete error:", error);
          Alert.alert("Error", "Failed to delete medication");
        } finally {
          setShowDeleteModal(false);
          setMedToDelete(null);
        }
      };

    const setupNotifications = async () => {
        try {
            const token = await registerForPushNotificationsAsync();
            if (!token) {
                console.log("Failed to get push notification token");
                return;
            }

            const medications = await getMedication();
            for (const medication of medications) {
                if (medication.reminderEnabled) {
                    await scheduleMedicationReminder(medication);
                }
            }
        } catch (error) {
            console.log("Error setting up notifications:", error);
        }
    }

    useEffect(() => {
        loadMedications()
        setupNotifications()

        const subscription = AppState.addEventListener('change', (nextAppState)=> {
            loadMedications();
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = () => {
                //cleanup

            };

            loadMedications();
            return() => unsubscribe();
        }, [loadMedications])
    )

    const handleTakeDose = async (medication: Medication) => {

        
        try {
            await recordDose(medication.id, true, new Date().toISOString());
            await loadMedications()
        } catch (error) {
            console.log("Error recording dose:", error);
            Alert.alert("Error", "Failed to record dose. Please try again.");
        }
    }

    const isDoseTaken = (medicationId: string) => {
        return doseHistory.some(
            (dose) => dose.medicationId === medicationId && dose.taken
        );
    };

    // Calculate progress as a decimal between 0 and 1
    const progress = totalDoses > 0 ? Math.min(completedDoses / totalDoses, 1) : 0;
    const unreadCount = notifications.filter(n => !n.read).length;
    return (
        
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#e0e7f0', '#8ab4dc']} style={styles.header}>
                <View style={styles.headerContent}>

                    <View style={styles.headerTop}>
                        <View style={styles.headerIcons}>

                        <View style={{ flex: 1}}>

                            <Text style={styles.greeting}> Daily Progress</Text>
                        </View>

                        <TouchableOpacity 
                        // style={styles.notificationButton} 
                        onPress={() => setShowNotifications(true)}>
                        {/* <Ionicons name="notifications-outline" size={24} color="white" /> */}
                        {unreadCount > 0 && (
                            <View 
                            // style={styles.notificationBadge}
                            >
                            {/* <Text style={styles.notificationCount}>{unreadCount}</Text> */}
                            </View>
                        )}
                        
                        </TouchableOpacity>
                    </View>
                    </View>

                    
                 <CircularProgress 
                    progress={progress}
                    totalDoses={totalDoses}
                    completedDoses={completedDoses}
                />
                </View>
            </LinearGradient>
            <View style={styles.content}>
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}> Quick Actions </Text>
                    <View style={styles.quickActionsGrid}>
                        {QUICK_ACTIONS.map((action) => (
                            <Link href={action.route} key={action.label} asChild>
                                <TouchableOpacity style={styles.actionButton}>
                                    <LinearGradient colors={action.gradient} style={styles.actionGradient}>
                                        <View style={styles.actionContent}>
                                            <View style={styles.actionIcon}>
                                            <Ionicons name={action.icon} size={24} color="white" />
                                            </View>
                                            <Text style={styles.actionLabel}>
                                                {action.label}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                </View>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    <Link href="/calendar" asChild>
                        <TouchableOpacity>
                            <Text style={styles.seeAllButton}>See All</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {todaysMedications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="medical-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No Medications Scheduled for today</Text>
                        
                    </View>
                ): (
                    todaysMedications.map((medication)=> {
                        const taken = isDoseTaken(medication.id)
                        return (
                            <View style={styles.doseCard} key={medication.id}>
                                <View style={[styles.doseBadge,
                                {
                                    backgroundColor:`${medication.color}15`
                                }
                                ]}>
                                    <Ionicons name="medical" size={24} />
                                </View>
                                <View style={styles.doseInfo}>
                                    <View>
                                        <Text style={styles.medicineName}>{medication.name}</Text>
                                     
                                    </View>
                                </View>
                                {taken ? (
                                    <View style={styles.takeDoseButton}>
                                        <Ionicons name="checkmark-circle-outline" size={24} />
                                        <Text style={styles.takeDoseText}>Taken</Text>
                                    </View>
                                ): (
                                    <TouchableOpacity style={[styles.takeDoseButton, { backgroundColor: medication.color }]}
                                    onPress={() => handleTakeDose(medication)}
                                    >
                                        <Text style={styles.takeDoseText}>Take</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        setMedToDelete(medication.id);
                                        setShowDeleteModal(true);
                                    }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#e53935" />
                                        </TouchableOpacity>
                            </View>
                        )
                    })
                )}
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 30, marginBottom: 40 }}>
  <Text style={[styles.sectionTitle, {marginBottom: 5}]}>Order Medicine</Text>
  <View style={[styles.orderContainer, {marginTop: 20}]}>
    <Image 
      source={require('../public/GoRush_Logo.png')} 
      style={styles.companyLogo} 
      resizeMode="contain"
    />
    {/* <TouchableOpacity 
      style={styles.orderButton}
      onPress={() => Linking.openURL('https://www.gorushbn.com/order-form')}
    > */}
    <TouchableOpacity 
  style={styles.orderButton}
  onPress={() => router.push('/order-form')}
>
      <Text style={styles.orderButtonText}>Go to Order Form</Text>
    </TouchableOpacity>
  </View>
</View>

            <Modal
  visible={showNotifications}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowNotifications(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowNotifications(false)}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {todaysMedications.map((medication) => (
        <View style={styles.notificationItem} key={medication.id}>
          <View style={styles.notificationIcon}>
            <Ionicons name="medical" size={24} color={medication.color} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{medication.name}</Text>
            <Text style={styles.notificationMessage}>
              {medication.medicationType === 'pill-count' 
                ? `${medication.currentPills} pills remaining` 
                : `${medication.currentDose}mg remaining`}
            </Text>
            
            <TouchableOpacity
              style={styles.clearButtonSmall}
              onPress={async () => {
                const success = await clearMedicationNotification(medication.id);
                if (success) {
                  // Update local state to reflect changes
                  setMedications(prev => 
                    prev.map(m => 
                      m.id === medication.id 
                        ? {...m, reminderEnabled: false} 
                        : m
                    )
                  );
                  setTodaysMedications(prev => 
                    prev.filter(m => m.id !== medication.id)
                  );
                  await cancelMedicationReminders(medication.id);
                }
              }}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  </View>
</Modal>


<Modal
  visible={showDeleteModal}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowDeleteModal(false)}
>
  <View style={styles.centeredModalOverlay}>
    <View style={styles.centeredModalContent}>
      <Text style={styles.deleteModalTitle}>Delete Medication</Text>
      <Text style={styles.deleteModalText}>
        Are you sure you want to delete this medication?
      </Text>
      <View style={styles.deleteModalButtons}>
        <TouchableOpacity 
          style={styles.deleteModalCancel}
          onPress={() => setShowDeleteModal(false)}
        >
          <Text style={styles.deleteModalCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteModalConfirm}
          onPress={handleDeleteMedication}
        >
          <Text style={styles.deleteModalConfirmText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
                <Footer />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    greeting: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },

    notificationButton: {
        position: "relative",
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        marginLeft: 8,
    },
    notificationBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#ff5252",
        borderRadius: 10,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        minWidth: 20,
        borderColor: "#8ab4dc",
    },
    notificationCount: {
        fontSize: 11,
        fontWeight: "bold",
        color: "white",
    },
    progressContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    progressTextContainer: {
        position: "absolute",
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    progressPercentage: {
        fontSize: 36,
        color: "white",
        fontWeight: "bold",
    },
    progressLabel: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "bold",
    },
    progressDetails: {
        fontSize: 11,
        color: "white",
        fontWeight: "bold",
    },

    progressRing: {
        transform: [{ rotate: "-90deg" }]
    },

    quickActionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 15,
    },
    actionButton: {
        width: (width - 52) / 2,
        height: 110,
        borderRadius: 16,
        overflow: "hidden"
    },
    actionGradient: {
        flex: 1,
        padding: 15,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    actionLabel: {
        fontSize: 14,
        color: "white",
        fontWeight: "600",
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 5,
    },
    actionContent: {
        flex: 1,
        justifyContent: "space-between"
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    seeAllButton: {
        color: "#bc1b2b",
        fontWeight: "600"
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: "white",
        borderRadius: 16,
        marginTop: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        marginTop: 10,
        marginBottom: 20.
    },
    addMedicationButton: {
        backgroundColor: "#1a8e2d",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addMedicationButtonText: {
        color: "white",
        fontWeight: "600"
    },
    doseCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    doseBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    doseInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    medicineName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4
    },
    doseTime: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        marginLeft: 5,
        color: "#666",
        fontSize: 14,
    },
    takeDoseText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    takeDoseButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "80%"
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        padding: 5,
    },
    notificationItem: {
        flexDirection: "row",
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        marginBottom: 10,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e8f5e9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "333",
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: "#999"
    },
    // Add these to your existing styles
doseText: {
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteModalCancel: {
    padding: 10,
    marginRight: 10,
  },
  deleteModalCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  deleteModalConfirm: {
    padding: 10,
    backgroundColor: '#e53935',
    borderRadius: 6,
  },
  deleteModalConfirmText: {
    color: 'white',
    fontWeight: '600',
  },
  notificationPanel: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    elevation: 4,
    width: 250,
    zIndex: 999,
  },
  clearButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0284c7',
    borderRadius: 6,
  },
  clearButtonSmall: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  companyLogo: {
    width: 150,
    height: 60,
    alignSelf: 'center',
    marginBottom: 15,
  },
  
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  
  orderButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },  
  centeredModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  centeredModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
    },

headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
})