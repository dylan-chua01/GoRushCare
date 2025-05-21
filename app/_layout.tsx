import { useRefillChecks } from '@/hook/useRefillChecks';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  useRefillChecks();
  
  return (
    <>
      <StatusBar style='light' />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: 'white'},
          animation: 'slide_from_right',
          header: () => null,
          navigationBarHidden:true
        }}
      >
        <Stack.Screen name='index' 
          options={{ headerShown: false }}
        />
        <Stack.Screen name='medications/add'
        options={
          {
            headerShown: false,
            headerBackTitle: "",
            title: ""
          }
        } />
      </Stack>
    </>
  )
}