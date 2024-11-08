import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import HomeScreen from './src/components/Home';
import TaskScreen from './src/components/Task';
import CalendarScreen from './src/components/Calendar';
import ProfileScreen from './src/components/Profile';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import OnboardingScreen from './src/screen/OnBoarding';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Note from './src/components/Note';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust offset for iOS
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Use 'padding' for iOS and 'height' for Android
        >
            <Tab.Navigator
                initialRouteName="Home"
                screenOptions={{
                    tabBarActiveTintColor: '#F4AB05',
                    tabBarStyle: { backgroundColor: '#1A2529' },
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                    headerTitle: 'Flexido',
                    headerStyle: { backgroundColor: '#1A2529', height: 90 },
                    headerTintColor: '#fff',
                    headerTitleStyle: { marginBottom: 10, fontFamily: 'figtree', fontWeight: 'bold' }
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
                            tabBarButton: () => null, // This hides the tab bar button for Note
                        }}
                    />
            </Tab.Navigator>
        </KeyboardAvoidingView>
    );
}

function CustomDrawerContent(props) {
    const activeRoute = useNavigationState(state => {
        const tabState = state.routes.find(route => route.name === "Flexido")?.state;
        return tabState ? tabState.routes[tabState.index].name : "";
    });

    const getDrawerItemStyle = (routeName) => {
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
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="AppNavigator" component={DrawerNavigator} />
                <Stack.Screen name="Note" component={Note}/>
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
        backgroundColor: '#F4AB05', // Active background color
        borderRadius: 10,
    },
    drawerLabel: {
        color: '#000', // Default label color
        fontSize: 16,
    },
    activeLabel: {
        fontWeight: 'bold', // Active label style
        color: '#F4AB05', // Active label color
    },
});
