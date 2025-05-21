import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const {width} = Dimensions.get('window');



export default function AuthScreen() {

    const [hasBiometrics, setHasBiometrics] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(hasHardware && isEnrolled);
    }


    const authenticate = async () => {
        try {
            setIsAuthenticating(true);
            setError(null);

            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync;

            //handle supported types
            const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: hasHardware && hasBiometrics ? 'Use face ID/TouchID' : 'Enter your PIN to access medications',
                fallbackLabel: 'Use PIN',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            })

            if(auth.success){
                router.replace('/home');
            } else {
                setError('Authentication Failed: Please try again')
            }
        } catch (error) {
            setError('Authentication Failed: Please try again')
        } finally {
            setIsAuthenticating(false);
        }
    }

    return (
        <LinearGradient colors={['#e0e7f0', '#8ab4dc']} style={styles.container}>
            
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                <Image 
      source={require('../public/GoRush_Logo.png')} 
      style={styles.companyLogo} 
      resizeMode="contain"
    />
                </View>

                <Text style={styles.title}>
                    Care
                </Text>
                    
                <Text style={styles.subtitle}>
                    Your Personal Medication Reminder
                </Text>

                <View style={styles.card}>
                    <Text style={styles.welcomeText}>
                        Welcome Back!   
                    </Text>

                    <Text style={styles.instructionText}>
                        {hasBiometrics ? "Use face ID/TouchID Or PIN to access your medications" : "Enter your PIN to access your medications"}
                    </Text>

                    <TouchableOpacity style={[styles.button, isAuthenticating && styles.buttonDisabled]}
                        onPress={authenticate}
                        disabled={isAuthenticating}
                    >
                        <Ionicons
                            name={hasBiometrics ? 'finger-print-outline':'keypad-outline'}
                            size={24}
                            color='white'
                            style={styles.buttonIcon}
                        />
                        <Text
                            style={styles.buttonText}
                        >
                            {isAuthenticating ? "Verifying..." : hasBiometrics ? "Authenticate" : "Enter PIN"}
                        </Text>
                    </TouchableOpacity>

                    {error && <View style={styles.errorContainer}>
                        <Ionicons name='alert-circle' size={20} color={'#f44336'} />
                        <Text style={styles.errorText}>
                          {error}  
                        </Text>
                        </View>}
                </View>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(29, 116, 188, 0.1)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        color: '#1d74bc',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#5292cc',
        marginBottom: 30,
        textAlign: 'center'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        alignItems: 'center',
        shadowColor: '#448cc4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1d74bc',
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 14,
        color: '#5292cc',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(29, 116, 188, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: '#1d74bc',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(191, 47, 62, 0.1)',
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: '#bf2f3e',
        marginLeft: 5,
        fontSize: 14,
    },
    companyLogo: {
        width: 250,
        height: 100,
        alignSelf: 'center',
        marginBottom: 10,
      },
})