import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import HomeScreen from './src/components/Home';
import TaskScreen from './src/components/Task';
import CalendarScreen from './src/components/Calendar';
import ProfileScreen from './src/components/Profile';
import OnboardingScreen from './src/screen/OnBoarding';
import Note from './src/components/Note';
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import Task from './src/components/Task';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Tab.Navigator
                initialRouteName="Home"
                screenOptions={{
                    tabBarActiveTintColor: '#F4AB05',
                    tabBarStyle: { backgroundColor: '#1A2529' },
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ size, color }) => (
                            <Ionicons name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Task"
                    component={TaskScreen}
                    options={{
                        tabBarIcon: ({ size, color }) => (
                            <Ionicons name="list" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Calendar"
                    component={CalendarScreen}
                    options={{
                        tabBarIcon: ({ size, color }) => (
                            <Ionicons name="calendar" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ size, color }) => (
                            <Ionicons name="person" size={size} color={color} />
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
            </Tab.Navigator>
        </KeyboardAvoidingView>
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
                label="Home"
                onPress={() => props.navigation.navigate('Home')}
                style={[styles.drawerItem, getDrawerItemStyle('Home')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Home' && styles.activeLabel]}
            />
            <DrawerItem
                icon={({ size, color }) => <Ionicons name="list" size={size} color={color} />}
                label="Task"
                onPress={() => props.navigation.navigate('Task')}
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
        </DrawerContentScrollView>
    );
}

function DrawerNavigator() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
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

function AppNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const loggedInStatus = await AsyncStorage.getItem('isLoggedIn');
            setIsLoggedIn(loggedInStatus === 'true');
        };
        checkLoginStatus();
    }, []);

    if (isLoggedIn === null) return null; // Wait until login status is checked

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <Stack.Screen name="Flexido" component={DrawerNavigator} />
                ) : (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                )}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Note" component={Note} />
                <Stack.Screen name="Task" component={Task} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;

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
