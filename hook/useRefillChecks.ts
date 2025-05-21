import { checkRefillReminders } from '@/utils/notifications';
import { useFocusEffect } from 'expo-router';
import React from 'react';

export function useRefillChecks() {
  useFocusEffect(
    React.useCallback(() => {
      // Check immediately when screen focuses
      checkRefillReminders();
      
      // Then check every hour
      const interval = setInterval(() => {
        checkRefillReminders();
      }, 60 * 60 * 1000); // 1 hour
      
      return () => clearInterval(interval);
    }, [])
  );
}