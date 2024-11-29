import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  useNavigationState,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import HomeScreen from "./src/components/Home";
import Icon from "react-native-vector-icons/FontAwesome";
import TaskScreen from "./src/components/Task";
import CalendarScreen from "./src/components/Calendar";
import ProfileScreen from "./src/components/Profile";
import OnboardingScreen from "./src/screen/OnBoarding";
import Note from "./src/components/Note";
import LoginScreen from "./src/screen/LoginScreen";
import RegisterScreen from "./src/screen/RegisterScreen";
import Task from "./src/components/Task";
import { color } from "@rneui/themed/dist/config";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import CategoryNotes from "./src/components/CategoriesNotes";
import TaskDetailScreen from "./src/components/TaskDetail";
import TaskDetail from "./src/components/TaskDetail";
import EditProfile from "./src/components/EditProfile";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Divider } from "react-native-paper";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "#F4AB05",
        tabBarStyle: {
          backgroundColor: "#141d20",
          height: 72,
          paddingBottom: 9,
          paddingTop: 5,
          borderTopColor: "#3b3b3b",
          borderTopWidth: 0.3,
        },
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 4,
          fontFamily: "figtree",
        },
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
                    navigation.navigate("Note");
                  }, 100);
                }}
                style={{
                  top: -30,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#F4AB05",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
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

const CustomDrawerContent = ({ navigation }) => {
    const [user, setUser] = useState({
      fullName: '',
      email: '',
      photoURL: '',
    });
    const auth = getAuth();
    const firestore = getFirestore();
    const currentUser = auth.currentUser;
  
    useEffect(() => {
      if (currentUser) {
        const fetchUserProfile = async () => {
          try {
            const profileRef = doc(firestore, `users/${currentUser.uid}/profile`, '8Js4h1TvZBMGR6MngvLg');
            const docSnap = await getDoc(profileRef);
  
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              setUser({
                fullName: profileData.fullName || currentUser.displayName,
                email: currentUser.email,
                photoURL: profileData.photoURL || currentUser.photoURL,
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            Alert.alert('Error', 'Failed to fetch user profile.');
          }
        };
  
        fetchUserProfile();
      }
    }, [currentUser]);
  
    const handleLogout = async () => {
      try {
        await FIREBASE_AUTH.signOut();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } catch (error) {
        console.error('Logout Error:', error);
        Alert.alert('Logout failed: ', error.message);
      }
    };
  
    const activeRoute = useNavigationState((state) => {
      const activeTab = state.routes[state.index];
      return activeTab?.name;
    });
  
    const getDrawerItemStyle = (routeName) => {
      return activeRoute === routeName ? styles.activeBackground : styles.inactiveBackground;
    };
  
    return (
      <DrawerContentScrollView contentContainerStyle={styles.drawerContainer}>
        <View style={styles.header}>
            <Text style={styles.appName}>Flexido</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { userData: user })}>
            <Image
                source={user.photoURL ? { uri: user.photoURL } : require('./assets/images/pp-kosong.jpg')}
                style={styles.profileImage}
            />
            </TouchableOpacity>
            <Text style={styles.userName}>{user.fullName || ''}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        
        <Divider/>
  
        <View style={styles.navigation}>
        <DrawerItem
          icon={({ size, color }) => (
            <Ionicons name="home" size={size} color='#fff' />
          )}
          label="Days"
          onPress={() => navigation.navigate("Days")}
          style={getDrawerItemStyle("Days")}
          labelStyle={styles.drawerLabel}
        />
        <DrawerItem
          icon={({ size, color }) => (
            <Ionicons name="list" size={size} color='#fff' />
          )}
          label="All Task"
          onPress={() => navigation.navigate("All Task")}
          style={[styles.drawerItem, getDrawerItemStyle("All Task")]}
          labelStyle={[
            styles.drawerLabel,
            activeRoute === "All Task" && styles.activeLabel,
          ]}
        />
        <DrawerItem
          icon={({ size, color }) => (
            <Ionicons name="calendar" size={size} color='#fff' />
          )}
          label="Calendar"
          onPress={() => navigation.navigate("Calendar")}
          style={getDrawerItemStyle("Calendar")}
          labelStyle={styles.drawerLabel}
        />
        <DrawerItem
          icon={({ size, color }) => (
            <Ionicons name="person" size={size} color='#fff' />
          )}
          label="Profile"
          onPress={() => navigation.navigate("Profile")}
          style={getDrawerItemStyle("Profile")}
          labelStyle={styles.drawerLabel}
        />
      </View>
  
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    );
  };
  

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen
        name="Flexido"
        component={TabNavigator}
        options={{
          headerStyle: { backgroundColor: "#1A2529", height: 90 },
          headerTintColor: "#fff",
          headerTitleStyle: {
            marginBottom: 10,
            fontFamily: "figtree",
            fontWeight: "bold",
          },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  
    useEffect(() => {
      const checkLoginStatus = async () => {
        const loggedInStatus = await AsyncStorage.getItem('isLoggedIn');
        const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
        setIsLoggedIn(loggedInStatus === 'true');
        setHasSeenOnboarding(onboardingStatus === 'true');
      };
  
      checkLoginStatus();
    }, []);
  
    if (isLoggedIn === null) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Menampilkan Onboarding jika belum selesai */}
          {!hasSeenOnboarding ? (
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onFinish={async () => {
                    await AsyncStorage.setItem("hasSeenOnboarding", "true");
                    setHasSeenOnboarding(true);
                  }}
                />
              )}
            </Stack.Screen>
          ) : isLoggedIn ? (
            // Jika pengguna sudah login, arahkan ke Home
            <Stack.Screen name="Home" component={DrawerNavigator} />
          ) : (
            // Jika pengguna belum login, arahkan ke Login
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={async () => {
                    await AsyncStorage.setItem("isLoggedIn", "true");
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
    backgroundColor: "#F4AB05",
    borderRadius: 10,
  },
  drawerLabel: {
    color: "#fff",
    fontSize: 16,
  },
  activeLabel: {
    fontWeight: "bold",
    color: "#F4AB05",
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: "#1A2529",
  },
  header: {
    alignItems: "center",
    padding: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F4AB05",
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  userEmail: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 10,
  },
  divider: {
    backgroundColor: "#3b3b3b",
    height: 1,
    width: "100%",
  },
  navigation: {
    flex: 1,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4AB05",
    margin: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 16,
    color: "#141d20",
    marginLeft: 5,
  },
  activeItem: {
    backgroundColor: "#F4AB05",
    borderRadius: 10,
  },
  inactiveBackground: {
    backgroundColor: "transparent",
  },
});
