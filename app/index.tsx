import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const router = useRouter();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            router.replace('/auth');
        }, 2000)

        return () => clearTimeout(timer);
    }, [])

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.iconContainer,
                {
                    opacity: fadeAnim,
                    transform: [{scale: scaleAnim}]
                }
            ]}>
                <Ionicons name='medical' size={100} color="#1d74bc" />
                <Text style={styles.appName}>GoRush Care</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0e7f0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconContainer: {
        alignItems: 'center',
    },
    appName: {
        color: '#1d74bc',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 1,
    }
});