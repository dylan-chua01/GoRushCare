import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication, getMedication } from './storage';

// Set up notification handler with proper typing
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    })
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    try {
        const response = await Notifications.getExpoPushTokenAsync();
        token = response.data;

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#1a8e2d",
            });
        }

        return token;
    } catch (error) {
        console.log("Error getting push token:", error);
        return null;
    }
}

export async function scheduleMedicationReminder(
    medication: Medication
): Promise<string[] | undefined> {
    if (!medication.reminderEnabled) return;

    try {
        const identifiers: string[] = [];
        
        for (const time of medication.times) {
            const [hours, minutes] = time.split(":").map(Number);
            const today = new Date();
            today.setHours(hours, minutes, 0, 0);

            if (today < new Date()) {
                today.setDate(today.getDate() + 1);
            }

            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Medication Reminder",
                    body: `Time to take ${medication.name} (${medication.dosage})`,
                    data: { medicationId: medication.id },
                    sound: true,
                },
                trigger: {
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                }
            });

            identifiers.push(identifier);
        }

        return identifiers;
    } catch (error) {
        console.error("Error scheduling medication reminder:", error);
        return undefined;
    }
}

export async function cancelMedicationReminders(
    medicationId: string
): Promise<void> {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        for (const notification of scheduledNotifications) {
            const data = notification.content.data as { medicationId?: string };
            if (data?.medicationId === medicationId) {
                await Notifications.cancelScheduledNotificationAsync(
                    notification.identifier
                );
            }
        }
    } catch (error) {
        console.error("Error canceling medication reminders:", error);
        throw error;
    }
}

export async function updateMedicationReminders(
    medication: Medication
): Promise<void> {
    try {
        await cancelMedicationReminders(medication.id);
        await scheduleMedicationReminder(medication);
    } catch (error) {
        console.error("Error updating medication reminders:", error);
        throw error;
    }
}

// Helper function to get pending notifications with proper typing
export async function getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
}

// Helper function for immediate notifications
export async function presentLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: null, // immediate
    });
}

export async function checkRefillReminders() {
    const medications = await getMedication();
    const now = new Date();
    
    for (const med of medications) {
      if (med.refillReminder && med.currentSupply <= med.refillAt) {
        await scheduleRefillNotification(med);
      }
    }
  }
  
  async function scheduleRefillNotification(medication: Medication) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Refill!",
        body: `Your ${medication.name} is running low (${medication.currentSupply} doses left)`,
        data: { medicationId: medication.id },
      },
      trigger: { seconds: 1 }, // Immediate notification
    });
  }