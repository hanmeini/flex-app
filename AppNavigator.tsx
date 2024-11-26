import React, { useEffect, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import HomeScreen from './src/components/Home';
import Icon from 'react-native-vector-icons/FontAwesome';
import TaskScreen from './src/components/Task';
import CalendarScreen from './src/components/Calendar';
import ProfileScreen from './src/components/Profile';
import OnboardingScreen from './src/screen/OnBoarding';
import Note from './src/components/Note';
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import Task from './src/components/Task';
import { color } from '@rneui/themed/dist/config';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import CategoryNotes from './src/components/CategoriesNotes';
import TaskDetailScreen from './src/components/TaskDetail';
import TaskDetail from './src/components/TaskDetail';
import EditProfile from './src/components/EditProfile';
import { View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarActiveTintColor: '#F4AB05',
                tabBarStyle: {
                    backgroundColor: '#141d20',
                    height: 72,
                    paddingBottom: 9,
                    paddingTop: 5,
                    borderTopColor: '#3b3b3b',
                    borderTopWidth: 0.3,
                },
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarLabelStyle: { fontSize: 12, paddingBottom: 4, fontFamily: 'figtree' },
                tabBarHideOnKeyboard: true, // Tambahkan ini
            }}
        >
            <Tab.Screen
                name="Days"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <Icon name="bullseye" size={25} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="All Task"
                component={TaskScreen}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <Icon name="tasks" size={20} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="CreateTask"
                component={() => null}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="add"
                            size={30}
                            color="#FFFFFF"
                            style={{ marginTop: 5 }}
                        />
                    ),
                    tabBarLabel: "",
                    tabBarButton: (props) => {
                        const navigation = useNavigation();
                        const scaleValue = useRef(new Animated.Value(1)).current;

                        const animateIn = () => {
                            Animated.spring(scaleValue, {
                                toValue: 1.2,
                                useNativeDriver: true,
                            }).start();
                        };

                        const animateOut = () => {
                            Animated.spring(scaleValue, {
                                toValue: 1,
                                friction: 4,
                                useNativeDriver: true,
                            }).start();
                        };

                        return (
                            <TouchableOpacity
                                {...props}
                                onPress={() => {
                                    animateIn();
                                    setTimeout(() => {
                                        animateOut();
                                        navigation.navigate('Note');
                                    }, 100);
                                }}
                                style={{
                                    top: -30,
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    backgroundColor: '#F4AB05',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 5,
                                    elevation: 5,
                                }}
                            >
                                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                                    <Icon name="plus" size={20} color="#141d20" />
                                </Animated.View>
                            </TouchableOpacity>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="calendar-clear-outline" size={21} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <Icon name="user" size={23} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Note"
                component={Note}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="TaskDetail"
                component={TaskDetail}
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tab.Screen
                name="CategoryNotes"
                component={CategoryNotes}
                options={{
                    tabBarButton: () => null,
                }}
            />
        </Tab.Navigator>
    );
}

function CustomDrawerContent(props:any) {
    const activeRoute = useNavigationState(state => {
        const tabState = state.routes.find(route => route.name === "Flexido")?.state;
        return tabState ? tabState.routes[tabState.index].name : "";
    });

    const getDrawerItemStyle = (routeName:any) => {
        return activeRoute === routeName ? styles.activeBackground : null;
    };

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItem
                icon={({ size, color }) => <Ionicons name="home" size={size} color={color} />}
                label="Today"
                onPress={() => props.navigation.navigate('Home')}
                style={[styles.drawerItem, getDrawerItemStyle('Home')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Home' && styles.activeLabel]}
            />
            <DrawerItem
                icon={({ size, color }) => <Ionicons name="list" size={size} color={color} />}
                label="All Task"
                onPress={() => props.navigation.navigate('TaskDetail')}
                style={[styles.drawerItem, getDrawerItemStyle('Task')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Task' && styles.activeLabel]}
            />
            <DrawerItem
                icon={({ size, color }) => <Ionicons name="calendar" size={size} color={color} />}
                label="Calendar"
                onPress={() => props.navigation.navigate('Calendar')}
                style={[styles.drawerItem, getDrawerItemStyle('Calendar')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Calendar' && styles.activeLabel]}
            />
            <DrawerItem
                icon={({ size, color }) => <Ionicons name="person" size={size} color={color} />}
                label="Profile"
                onPress={() => props.navigation.navigate('Profile')}
                style={[styles.drawerItem, getDrawerItemStyle('Profile')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Profile' && styles.activeLabel]}
            />
            <DrawerItem
                label="Note"
                onPress={() => props.navigation.navigate('Note')}
                style={[styles.drawerItem, getDrawerItemStyle('Note')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Note' && styles.activeLabel]}
            />
        </DrawerContentScrollView>
    );
}

function DrawerNavigator() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{headerShown: false}}>
            <Drawer.Screen
                name="Flexido"
                component={TabNavigator}
                options={{
                    headerStyle: { backgroundColor: '#1A2529', height: 90 },
                    headerTintColor: '#fff',
                    headerTitleStyle: { marginBottom: 10, fontFamily: 'figtree', fontWeight: 'bold' },
                }}
            />
        </Drawer.Navigator>
    );
}


export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        // Ambil status login dan onboarding dari AsyncStorage
        const loggedInStatus = await AsyncStorage.getItem('isLoggedIn');
        const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');

        setIsLoggedIn(loggedInStatus === 'true'); // Set login status
        setHasSeenOnboarding(onboardingStatus === 'true'); // Set onboarding status
      } catch (error) {
        console.error('Error loading app state:', error);
      }
    };

    loadAppState();
  }, []);

  // Tampilkan loading spinner saat memeriksa status
  if (isLoggedIn === null || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Jika onboarding belum selesai, tampilkan layar Onboarding */}
        {!hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onFinish={async () => {
                  await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                  setHasSeenOnboarding(true);
                }}
              />
            )}
          </Stack.Screen>
        ) : isLoggedIn ? (
          // Jika user sudah login, arahkan ke Home
          <Stack.Screen name="Flexido" component={DrawerNavigator} />
        ) : (
          // Jika user belum login, arahkan ke Login
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                {...props}
                onLoginSuccess={async () => {
                  await AsyncStorage.setItem('isLoggedIn', 'true');
                  setIsLoggedIn(true);
                }}
              />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Flexido" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}  


const styles = StyleSheet.create({
    drawerItem: {
        marginVertical: 5,
    },
    activeBackground: {
        backgroundColor: '#F4AB05',
        borderRadius: 10,
    },
    drawerLabel: {
        color: '#000',
        fontSize: 16,
    },
    activeLabel: {
        fontWeight: 'bold',
        color: '#F4AB05',
    },
});
