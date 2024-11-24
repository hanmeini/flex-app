import React, { useEffect, useState } from 'react';
import AppNavigator from './AppNavigator';
import './global.css';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);

  // Function to register for push notifications
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'figtree': require('./assets/fonts/Figtree-Regular.ttf'),
        'figtree-semibold': require('./assets/fonts/Figtree-SemiBold.ttf'),
        'figtree-regular': require('./assets/fonts/Figtree-Regular.ttf'),
        'figtree-bold': require('./assets/fonts/Figtree-Bold.ttf') // Adjust path if needed
      });
      setFontsLoaded(true);
    };

    loadFonts();

    // Register for push notifications
    const registerForPushNotificationsAsync = async () => {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

      if (status !== 'granted') {
        Alert.alert('Permission for notifications denied');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);  // Save the push token
    };

    registerForPushNotificationsAsync();

    // Handle incoming notifications while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Handle response when the app is opened from a notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification opened: ", response);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null; // Or you can show a loading indicator here
  }

  return (
    <>
      <AppNavigator />
      {/* You can use the expoPushToken to send push notifications to this device */}
    </>
  );
}
