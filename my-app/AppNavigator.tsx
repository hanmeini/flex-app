import React, { useEffect, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
import TaskDetailScreen from './src/components/TaskDetailScreen';


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
                       tabBarStyle: {
                        backgroundColor: '#141d20',
                        height: 72,
                        paddingBottom: 9,
                        paddingTop: 5,
                        borderTopColor: '#3b3b3b',
                        borderTopWidth: 0.3
                    },
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                    tabBarLabelStyle: { fontSize: 12, paddingBottom: 4, fontFamily: 'figtree'},
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
    component={() => null} // Tidak ada komponen karena ini hanya tombol
    options={{
        tabBarIcon: ({ color }) => (
            <Ionicons
                name="add"
                size={30}
                color="#FFFFFF"
                style={{ marginTop: 5 }}
            />
        ),
        tabBarLabel: "", // Menghilangkan teks di bawah ikon
        tabBarButton: (props) => {
            const navigation = useNavigation();  // Mengakses navigation dengan useNavigation()
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
                    friction: 4, // Mengatur efek bouncing agar lebih halus
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
                        }, 100); // Animasi kembali ke ukuran awal sebelum navigasi
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
                    <Animated.View style={{ transform: [{  scale: scaleValue }] }}>
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
                label="Today"
                onPress={() => props.navigation.navigate('Home')}
                style={[styles.drawerItem, getDrawerItemStyle('Home')]}
                labelStyle={[styles.drawerLabel, activeRoute === 'Home' && styles.activeLabel]}
            />
            <DrawerItem
                icon={({ size, color }) => <Ionicons name="list" size={size} color={color} />}
                label="All Task"
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
                name="Flexidos"
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
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            const loggedInStatus = await AsyncStorage.getItem('isLoggedIn');
            const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
            setIsLoggedIn(loggedInStatus === 'true');
            setHasSeenOnboarding(onboardingStatus === 'true');
        };
        checkStatus();
    }, []);

    if (isLoggedIn === null || hasSeenOnboarding === null) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasSeenOnboarding ? (
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingScreen}
                        options={{
                            animationEnabled: true,
                        }}
                    />
                ) : isLoggedIn ? (
                    <Stack.Screen name="Flexido" component={DrawerNavigator} />
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}

<Stack.Screen name="TaskDetail" component={TaskDetailScreen}/>
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Note" component={Note} />
                <Stack.Screen name="Task" component={Task} />
                <Stack.Screen name="Login" component={LoginScreen}/>
                <Stack.Screen name="Flexido" component={DrawerNavigator}/>
                <Stack.Screen name="CategoryNotes" component={CategoryNotes} />
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
