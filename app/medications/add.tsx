import { scheduleMedicationReminder } from "@/utils/notifications";
import { addMedication } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window")

const DURATIONS = [
    { id: '1', label: '7 days', value: 7},
    { id: '2', label: '14 days', value: 14},
    { id: '3', label: '30 days', value: 30},
    { id: '4', label: '90 days', value: 90},
    { id: '5', label: 'Ongoing', value: -1}
]

export default function AddMedicationScreen() {
    const router = useRouter();

    // Update your form state to include refill fields
const [form, setForm] = useState({
    name: "",
    dosage: "",
    duration: "",
    startDate: new Date(),
    times: [""],
    notes: "",
    reminderEnabled: true,
    // Add these refill-related fields
    medicationType: 'pill-count', // default
    pillsPerDose: 1,
    currentPills: '',
    refillAtPills: '',
    dosePerTake: '',
    currentDose: '',
    refillAtDose: '',
  });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedDuration, setSelectedDuration] = useState("");
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    const renderDurationOptions = () => {
        return (
            <SafeAreaView style={styles.optionsGrid}>
                {DURATIONS.map((dur) => (
                    <TouchableOpacity
                        key={dur.id}
                        style={[styles.optionCard, selectedDuration === dur.label && styles.selectedOptionCard]}
                        onPress={() => {
                            setSelectedDuration(dur.label);
                            setForm({...form, duration: dur.label});
                        }}
                    >
                        <Text style={[styles.durationNumber, selectedDuration === dur.label && styles.selectedDurationNumber]}>
                            {dur.value > 0 ? dur.value : "∞"}
                        </Text>
                        <Text style={[styles.optionLabel, selectedDuration === dur.label && styles.selectedOptionLabel]}>
                            {dur.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </SafeAreaView>
        );
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
      
        if (!form.name.trim()) {
          newErrors.name = "Medication name is required";
        }
      
        // Make dosage optional for pill-count medications
        if (form.medicationType === "dose-based" && !form.dosage.trim()) {
          newErrors.dosage = "Dosage is required for dose-based medications";
        }
      
        if (!form.duration.trim()) {
          newErrors.duration = "Duration is required";
        }
      
        // Refill tracking validation
        if (form.medicationType === "pill-count") {
          if (!form.currentPills || isNaN(Number(form.currentPills))) {
            newErrors.currentPills = "Current pill count must be a number";
          }
          if (!form.pillsPerDose || isNaN(Number(form.pillsPerDose))) {
            newErrors.pillsPerDose = "Pills per dose must be a number";
          }
          if (!form.refillAtPills || isNaN(Number(form.refillAtPills))) {
            newErrors.refillAtPills = "Refill threshold (pills) must be a number";
          }
        } else if (form.medicationType === "dose-based") {
          if (!form.dosage.trim()) {
            newErrors.dosage = "Dosage is required";
          }
          if (!form.dosePerTake || isNaN(Number(form.dosePerTake))) {
            newErrors.dosePerTake = "Dose per take must be a number";
          }
          if (!form.currentDose || isNaN(Number(form.currentDose))) {
            newErrors.currentDose = "Current dose must be a number";
          }
          if (!form.refillAtDose || isNaN(Number(form.refillAtDose))) {
            newErrors.refillAtDose = "Refill threshold (dose) must be a number";
          }
        }
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        try {
            if(!validateForm()) {
                Alert.alert("Error", "Please fill in all required fields to continue")
                return;
            }
    
            if(isSubmitting) return;
            setIsSubmitting(true);
    
            const colors = ["#4caf50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
            const medicationData = {
                id: Math.random().toString(36).substr(2, 9),
                ...form,
                startDate: form.startDate.toISOString(),
                color: randomColor,
                reminderEnabled: form.reminderEnabled,
                // Only include dosage if it exists or if dose-based
                dosage: form.medicationType === 'dose-based' ? form.dosage : form.dosage || '',
                // Normalize numerical fields based on medication type
                ...(form.medicationType === "pill-count"
                  ? {
                      currentSupply: Number(form.currentPills),
                      totalSupply: Number(form.currentPills),
                      refillAt: Number(form.refillAtPills),
                      pillsPerDose: Number(form.pillsPerDose),
                    }
                  : {
                      dosePerTake: Number(form.dosePerTake),
                      currentDose: Number(form.currentDose),
                      refillAt: Number(form.refillAtDose),
                    }),
              };
    
            await addMedication(medicationData);
            
            if(medicationData.reminderEnabled) {
                await scheduleMedicationReminder(medicationData);
            }
    
            Alert.alert(
                "Success",
                "Medication added successfully",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ],
                { cancelable: false }
            );
    
        } catch (error) {
            console.error('Save error', error);
            Alert.alert(
                "Error",
                "Failed to save medication. Please try again.",
                [{ text: "OK "}],
                { cancelable: false }
            );
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#e0e7f0", "#8ab4dc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1}}
                style={styles.headerGradient}
            />
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()} >
                        <Ionicons name="chevron-back" size={28} color={'#bc1b2b'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Medication</Text>
                </View>

                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={styles.formContentContainer}
                >
                    {/* Basic Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Basic Information</Text>

                        <View style={styles.section}>
  <Text style={styles.sectionHeader}>Medication Type</Text>
  
  <View style={styles.typeSelector}>
    <TouchableOpacity
      style={[
        styles.typeOption,
        form.medicationType === 'pill-count' && styles.typeOptionActive
      ]}
      onPress={() => setForm({...form, medicationType: 'pill-count'})}
    >
      <Ionicons 
        name="medical" 
        size={24} 
        color={form.medicationType === 'pill-count' ? '#1a8e2d' : '#666'} 
      />
      <Text style={styles.typeOptionText}>Pill Count</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        styles.typeOption,
        form.medicationType === 'dose-based' && styles.typeOptionActive
      ]}
      onPress={() => setForm({...form, medicationType: 'dose-based'})}
    >
      <Ionicons 
        name="flask" 
        size={24} 
        color={form.medicationType === 'dose-based' ? '#1a8e2d' : '#666'} 
      />
      <Text style={styles.typeOptionText}>Dose Based</Text>
    </TouchableOpacity>
  </View>

  {form.medicationType === 'pill-count' ? (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Pill Count *</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. 30"
          keyboardType="numeric"
          value={form.currentPills}
          onChangeText={(text) => setForm({...form, currentPills: text})}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Pills Per Dose *</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. 1"
          keyboardType="numeric"
          value={form.pillsPerDose.toString()}
          onChangeText={(text) => setForm({...form, pillsPerDose: Number(text) || 1})}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Refill At (pill count) *</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. 7 (when 7 pills left)"
          keyboardType="numeric"
          value={form.refillAtPills}
          onChangeText={(text) => setForm({...form, refillAtPills: text})}
        />
      </View>
    </>
  ) : (
    <>
      <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        Dosage {form.medicationType === 'dose-based' ? '*' : ''}
    </Text>
    <TextInput
        style={[
            styles.mainInput, 
            errors.dosage && styles.inputError,
            form.medicationType === 'pill-count' && styles.optionalInput
        ]}
        placeholder={
            form.medicationType === 'dose-based' 
                ? "e.g. 200mg" 
                : "e.g. 200mg (optional)"
        }
        placeholderTextColor={'#999'}
        value={form.dosage}
        onChangeText={(text) => {
            setForm({...form, dosage:text})
            if(errors.dosage) {
                setErrors({...errors, dosage: ""})
            }
        }}
    />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Dose Per Take *</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. 20 (in mg)"
          keyboardType="numeric"
          value={form.dosePerTake}
          onChangeText={(text) => setForm({...form, dosePerTake: text})}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Dose Remaining *</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. 200 (in mg)"
          keyboardType="numeric"
          value={form.currentDose}
          onChangeText={(text) => setForm({...form, currentDose: text})}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Refill At (mg remaining) *</Text>
        <TextInput
          style={styles.mainInput}
          placeholder="e.g. 50 (when 50mg left)"
          keyboardType="numeric"
          value={form.refillAtDose}
          onChangeText={(text) => setForm({...form, refillAtDose: text})}
        />
      </View>
    </>
  )}
</View>

                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Medication Name *</Text>
                            <TextInput
                                style={[styles.mainInput, errors.name && styles.inputError]}
                                placeholder="e.g. Ibuprofen"
                                placeholderTextColor={'#999'}
                                value={form.name}
                                onChangeText={(text) => {
                                    setForm({...form, name:text})
                                    if(errors.name) {
                                        setErrors({...errors, name: ""})
                                    }
                                }}
                            />
                            {errors.name && (
                                <Text style={styles.errorText}>{errors.name}</Text>
                            )}
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Dosage *</Text>
                            <TextInput
                                style={[styles.mainInput, errors.dosage && styles.inputError]}
                                placeholder="e.g. 500mg"
                                placeholderTextColor={'#999'}
                                value={form.dosage}
                                onChangeText={(text) => {
                                    setForm({...form, dosage:text})
                                    if(errors.dosage) {
                                        setErrors({...errors, dosage: ""})
                                    }
                                }}
                            />
                            {errors.dosage && (
                                <Text style={styles.errorText}>{errors.dosage}</Text>
                            )}
                        </View>
                    </View>

                    {/* Schedule Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Schedule</Text>
                        

                        <Text style={[styles.sectionSubtitle]}>Duration *</Text>
                        {errors.duration && (
                            <Text style={styles.errorText}>{errors.duration}</Text>
                        )}
                        {renderDurationOptions()}

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <View style={styles.dateIconContainer}>
                                <Ionicons name="calendar" size={20} color="#bc1b2b" />
                            </View>
                            <Text style={styles.dateButtonText}>
                                Starts: {form.startDate.toLocaleDateString()}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker 
                                value={form.startDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setForm({...form, startDate: date});
                                }}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                mode="time"
                                value={(() => {
                                    const [hours, minutes] = form.times[0].split(":").map(Number);
                                    const date = new Date();
                                    date.setHours(hours, minutes, 0, 0);
                                    return date;
                                })()}
                                onChange={(event, date) => {
                                    setShowTimePicker(false);
                                    if (date) {
                                        const hours = date.getHours().toString().padStart(2, '0');
                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                        const newTime = `${hours}:${minutes}`;
                                        setForm(prev => ({
                                            ...prev,
                                            times: prev.times.map((t, i) => (i === 0 ? newTime : t))
                                        }));
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* Reminders Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Reminders</Text>
                        <View style={styles.card}>
                            <View style={styles.switchRow}>
                                <View style={styles.switchLabelContainer}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="notifications" size={24} color="#bc1b2b" />
                                    </View>
                                    <View>
                                        <Text style={styles.switchLabel}>Enable Reminders</Text>
                                        <Text style={styles.switchSubLabel}>
                                            Get notified when it's time to take your medication
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={form.reminderEnabled}
                                    trackColor={{ false: '#ddd', true: '#1a8e2d' }}
                                    thumbColor={'white'}
                                    onValueChange={(value) => setForm({ ...form, reminderEnabled: value })}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Refill Section */}
                    <View style={styles.section}>
    <Text style={styles.sectionHeader}>Refill Tracking</Text>
    <View style={styles.card}>
        <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="repeat" size={24} color="#bc1b2b" />
                </View>
                <View>
                    <Text style={styles.switchLabel}>Enable Refill Reminders</Text>
                    <Text style={styles.switchSubLabel}>
                        Get notified when your medication is running low
                    </Text>
                </View>
            </View>
            <Switch
                value={form.refillReminder}
                trackColor={{ false: '#ddd', true: '#1a8e2d' }}
                thumbColor={'white'}
                onValueChange={(value) => setForm({ ...form, refillReminder: value })}
            />
        </View>

        {form.refillReminder && (
            <View style={styles.refillFieldsContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Current Supply (doses)</Text>
                    <TextInput
                        style={[styles.mainInput, errors.currentSupply && styles.inputError]}
                        placeholder="e.g. 30"
                        placeholderTextColor={'#999'}
                        value={form.currentSupply}
                        onChangeText={(text) => {
                            setForm({...form, currentSupply: text})
                            if(errors.currentSupply) {
                                setErrors({...errors, currentSupply: ""})
                            }
                        }}
                        keyboardType="numeric"
                    />
                    {errors.currentSupply && (
                        <Text style={styles.errorText}>{errors.currentSupply}</Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Refill Reminder At (doses remaining)</Text>
                    <TextInput
                        style={[styles.mainInput, errors.refillAt && styles.inputError]}
                        placeholder="e.g. 7 (will remind when 7 doses left)"
                        placeholderTextColor={'#999'}
                        value={form.refillAt}
                        onChangeText={(text) => {
                            setForm({...form, refillAt: text})
                            if(errors.refillAt) {
                                setErrors({...errors, refillAt: ""})
                            }
                        }}
                        keyboardType="numeric"
                    />
                    {errors.refillAt && (
                        <Text style={styles.errorText}>{errors.refillAt}</Text>
                    )}
                </View>
            </View>
        )}
    </View>
</View>

                    {/* Notes Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Additional Notes</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Add any special instructions or notes about this medication..."
                                placeholderTextColor="#999"
                                value={form.notes}
                                onChangeText={(text) => setForm({ ...form, notes: text})}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    
                </ScrollView>

                {/* Footer with Action Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isSubmitting && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={isSubmitting}
                    >
                        <LinearGradient
                            colors={["#F1D1D4", "#bc1b2b"]}
                            style={styles.saveButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0}}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSubmitting ? "Adding..." : "Add Medication"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa"
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 180 : 160,
    },
    content: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 24,
        zIndex: 1
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginLeft: 16,
    },
    scrollView: {
        flex: 1,
    },
    formContentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
        marginLeft: 4,
    },
    mainInput: {
        fontSize: 16,
        color: "#333",
        padding: 16,
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputError: {
        borderColor: "#FF5252",
        borderWidth: 1.5,
    },
    errorText: {
        color: "#FF5252",
        fontSize: 13,
        marginTop: 4,
        marginLeft: 8,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: "wrap",
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    optionCard: {
        width: (width - 72) / 2,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedOptionCard: {
        backgroundColor: "#1a8e2d",
        borderColor: "#1a8e2d",
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f5f5f5",
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectedOptionIcon: {
        backgroundColor: "rgba(255, 255, 255, 0.2)"
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: "#666",
        textAlign: 'center'
    },
    selectedOptionLabel: {
        color: "white"
    },
    durationNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: "#bc1b2b",
        marginBottom: 8,
    },
    selectedDurationNumber: {
        color: 'white',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: "#333",
    },
    timeContainer: {
        marginTop: 16,
    },
    timeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    timeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    timeButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: "#333"
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    switchLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#f5f5f5",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    switchSubLabel: {
        fontSize: 13,
        color: "#666",
    },
    textAreaContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    textArea: {
        height: 120,
        padding: 16,
        fontSize: 16,
        color: "#333",
        textAlignVertical: 'top',
    },
    footer: {
        padding: 24,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButton: {
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
        shadowColor: "#1a8e2d",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7
    },
    saveButtonGradient: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: '700'
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white"
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600"
    },
    refillFieldsContainer: {
        marginTop: 16,
    },
    typeSelector: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
},
typeOption: {
  flex: 1,
  alignItems: 'center',
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  marginHorizontal: 8,
},
typeOptionActive: {
  borderColor: '#bc1b2b',
  backgroundColor: '#F1D1D4',
},
typeOptionText: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: '600',
},
supplyText: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
},
refillText: {
  fontSize: 13,
  color: '#888',
  marginTop: 2,
},
optionalInput: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
},
})