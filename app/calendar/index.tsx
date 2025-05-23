import { DoseHistory, Medication, getDoseHistory, getMedication, recordDose } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { JSX, useCallback, useEffect, useState } from "react";
import { Alert, AppState, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Add this interface to define your route params
interface CalendarScreenParams {
  refresh?: string | number;
}

export default function CalendarScreen() {
    const router = useRouter();
    const params = router.params as CalendarScreenParams;
    const refresh = params?.refresh;
  
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [medications, setMedications] = useState<Medication[]>([]);
    const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);
  
    useEffect(() => {
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
          loadData();
        }
        setAppState(nextAppState);
      });
      return () => subscription.remove();
    }, [appState]);
  
    useEffect(() => {
      if (refresh) setRefreshKey(prev => prev + 1);
    }, [refresh]);
  
    const loadData = useCallback(async () => {
      try {
        const [meds, history] = await Promise.all([
          getMedication(),
          getDoseHistory()
        ]);
        setMedications(meds);
        setDoseHistory(history);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }, [refreshKey]);
  
    useFocusEffect(
      useCallback(() => {
        loadData();
        setForceUpdate(prev => !prev);
      }, [loadData])
    );
  
    useEffect(() => {
      loadData();
    }, [forceUpdate]);
  

      

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(selectedDate);

    const renderCalendar = () => {
        const calendar: JSX.Element[] = [];
        let week: JSX.Element[] = [];

        // Add empty days for the first week
        for (let i = 0; i < firstDay; i++) {
            week.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }

        // Add days of the month
        for (let day = 1; day <= days; day++) {
            const date = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                day
            );
            
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const hasDoses = doseHistory.some(
                (dose: DoseHistory) => new Date(dose.timestamp).toDateString() === date.toDateString()
            );

            week.push(
                <TouchableOpacity 
                    key={day} 
                    style={[
                        styles.calendarDay,
                        isToday && styles.today,
                        isSelected && styles.selectedDay,
                        hasDoses && styles.hasEvents,
                    ]}
                    onPress={() => {
                        setSelectedDate(date);
                        // Force refresh when selecting a new date
                        setForceUpdate(prev => !prev);
                    }}
                >
                    <Text style={[
                        styles.dayText, 
                        isToday && styles.todayText,
                        isSelected && styles.selectedDayText
                    ]}>
                        {day}
                    </Text>
                    {hasDoses && <View style={styles.eventDot} />}
                </TouchableOpacity>
            );

            // Start a new week
            if (week.length === 7 || day === days) {
                calendar.push(
                    <View key={`week-${day}`} style={styles.calendarWeek}>
                        {week}
                    </View>
                );
                week = [];
            }
        }

        return calendar;
    };

    // Add a direct dose taking function for the calendar (alternative approach)
    const takeDose = async (medicationId: string, date: Date) => {
        try {
            console.log(`Recording dose for medication ${medicationId} at ${date.toISOString()}`);
            await recordDose(medicationId, true, date.toISOString());
            console.log('Dose recorded successfully');
            // Force immediate refresh
            await loadData();
            // Force rerender
            setForceUpdate(prev => !prev);
        } catch (error) {
            console.error("Error recording dose:", error);
            Alert.alert(
                "Error",
                "Failed to record dose. Please try again.",
                [{ text: "OK" }]
            );
        }
    };

    const renderMedicationsForDate = () => {
        const dateStr = selectedDate.toDateString();
        const todayStr = new Date().toDateString();
        const dayDose = doseHistory.filter((dose: DoseHistory) => {
            return new Date(dose.timestamp).toDateString() === dateStr && dose.taken;
        });

        if (medications.length === 0) {
            return (
                <View style={styles.completedState}>
                    <Ionicons name="checkmark-circle" size={56} color="#4caf50" />
                    <Text style={styles.completedStateText}>All medications taken for today!</Text>
                </View>
            );
        }

        // Filter medications that should be active on the selected date
        const activeMeds = medications.filter(med => {
            const startDate = new Date(med.startDate);
            const durationDays = med.duration === "Ongoing" ? Infinity : parseInt(med.duration.split(" ")[0]);
            const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            
            return selectedDate >= startDate && selectedDate <= endDate;
        });

        if (activeMeds.length === 0) {
            return (
                <View style={styles.completedState}>
                    <Ionicons name="checkmark-circle" size={56} color="#4caf50" />
                    <Text style={styles.completedStateText}>All medications taken for today!</Text>
                </View>
            );
        }

        return activeMeds.map((medication) => {
            const taken = dayDose.some(
                (dose: DoseHistory) => dose.medicationId === medication.id
            );
            
            // Format times for display
            const times = medication.times.map(time => {
                const [hours, minutes] = time.split(':');
                const hourNum = parseInt(hours);
                const period = hourNum >= 12 ? 'PM' : 'AM';
                const displayHour = hourNum % 12 || 12;
                return `${displayHour}:${minutes} ${period}`;
            }).join(', ');

            return (
                <View key={medication.id} style={styles.medicationCard}>
                    <View style={[
                        styles.medicationColor, 
                        { backgroundColor: medication.color }
                    ]} />
                    <View style={styles.medicationInfo}>
                        <Text style={styles.medicationName}>{medication.name}</Text>
                        
                        <View style={styles.timeContainer}>
                        </View>
                    </View>

                    {taken ? (
                        <View style={styles.takenBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                            <Text style={styles.takenText}>Taken</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.takeDoseButton,
                                { backgroundColor: medication.color },
                            ]}
                            onPress={() => {
                                // Check if it's today or future
                                if (selectedDate.toDateString() >= new Date().toDateString()) {
                                    // OPTION 1: Direct handling on calendar (more reliable but keeps user on calendar)
                                    takeDose(medication.id, selectedDate);
                                    
                                } else {
                                    Alert.alert(
                                        "Cannot Record Dose",
                                        "You can only record doses for today or future dates",
                                        [{ text: "OK" }]
                                    );
                                }
                            }}
                        >
                            <Text style={styles.takeDoseText}>Take</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        });
    };

    const changeMonth = (increment: number) => {
        const newDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + increment,
            1
        );
        setSelectedDate(newDate);
        // Force refresh when changing months
        setForceUpdate(prev => !prev);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
        // Force refresh when going to today
        setForceUpdate(prev => !prev);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                style={styles.headerGradient}
                colors={["#e0e7f0", "#8ab4dc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            />
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Medication Calendar</Text>
                    <TouchableOpacity
                        style={styles.todayButton}
                        onPress={goToToday}
                    >
                        <Text style={styles.todayButtonText}>Today</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.calendarContainer}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity onPress={() => changeMonth(-1)}>
                            <Ionicons name="chevron-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.monthText}>
                            {selectedDate.toLocaleDateString("default", {
                                month: "long",
                                year: "numeric"
                            })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)}>
                            <Ionicons name="chevron-forward" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.weekdayHeader}>
                        {WEEKDAYS.map((day) => (
                            <Text style={styles.weekdayText} key={day}>{day}</Text>
                        ))}
                    </View>
                    
                    {renderCalendar()}
                </View>

                <View style={styles.scheduleContainer}>
                    <View style={styles.scheduleHeader}>
                        <Text style={styles.scheduleTitle}>
                            {selectedDate.toDateString() === new Date().toDateString() 
                                ? "Today's Medications" 
                                : selectedDate.toLocaleDateString("default", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric"
                                })
                            }
                        </Text>
                    </View>
                    <ScrollView 
                        style={styles.medicationList}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderMedicationsForDate()}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === "ios" ? 180 : 160,
    },
    content: {
        flex: 1,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingBottom: 16,
        zIndex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "white",
    },
    todayButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    todayButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    calendarContainer: {
        backgroundColor: "white",
        borderRadius: 16,
        margin: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
    },
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    monthText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333"
    },
    weekdayHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekdayText: {
        flex: 1,
        textAlign: "center",
        color: "#666",
        fontWeight: "500",
        fontSize: 14,
    },
    calendarWeek: {
        flexDirection: "row",
        marginBottom: 8,
    }, 
    calendarDay: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    dayText: {
        fontSize: 16,
        color: "#333",
        fontWeight: '500',
    },
    today: {
        backgroundColor: "#8ab4dc",
    },
    todayText: {
        color: "#1a8e2d",
        fontWeight: '600'
    },
    selectedDay: {
        backgroundColor: "#1a8e2d",
    },
    selectedDayText: {
        color: "white",
        fontWeight: '600'
    },
    hasEvents: {
        position: 'relative'
    },
    eventDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#1a8e2d",
        position: "absolute",
        bottom: 10,
    },
    scheduleContainer: {
        flex: 1,
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    scheduleHeader: {
        marginBottom: 16,
    },
    scheduleTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    scheduleSubtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    medicationList: {
        flex: 1,
    },
    medicationCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    medicationColor: {
        width: 8,
        height: 40,
        borderRadius: 4,
        marginRight: 16,
    },
    medicationInfo: {
        flex: 1,
    },
    medicationName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4
    },
    medicationDosage: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicationTime: {
        fontSize: 14,
        color: "#666",
        marginLeft: 4,
    },
    takeDoseButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    takeDoseText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14
    },
    takenBadge: {
        flexDirection: 'row',
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    takenText: {
        color: "#4caf50",
        fontWeight: "600",
        fontSize: 14,
        marginLeft: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
    },
    completedState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8f5e9', // Soft green background
        padding: 24,
        margin: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      },
      completedStateText: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '600',
        color: '#2e7d32', // Dark green for contrast
        textAlign: 'center',
      },
});