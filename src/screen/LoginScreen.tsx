import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Inisialisasi state

  // Initialize the Google Auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '974511282052-q2i8efijkpb4338osrpjd9li4bv21ner.apps.googleusercontent.com', // Replace with your Web Client ID from Firebase Console
    redirectUri: makeRedirectUri({ useProxy: true }),
  });

  const auth = FIREBASE_AUTH;

  const handleNext = () => {
    navigation.navigate('Register');
  };

  const signIn = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
  
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged in user:', user);
  
      await AsyncStorage.setItem('isLoggedIn', 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Flexido' }],
      });      
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  


  const toggleSecureText = () => {
    setSecureText(!secureText);
  };

  const signInWithGoogle = async () => {
    if (request?.loading) {
      console.log('Authentication request is still loading...');
      return; // Avoid calling promptAsync until the request is ready
    }

    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);

        const userCredential = await signInWithCredential(auth, credential);
        console.log(userCredential);

        await AsyncStorage.setItem('isLoggedIn', 'true');
        setTimeout(() => {
          navigation.navigate('Flexido');
        }, 500);
      } else {
        console.log('Google sign-in failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Login with Google failed');
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedInStatus = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedInStatus === 'true');
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
  
    checkLoginStatus();
  }, []);
  

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Login and Be Productive!</Text>

      {/* Email Input */}
      <TextInput
        value={email}
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#888"
        secureTextEntry={secureText}
        value={password}
        autoCapitalize="none"
        onChangeText={setPassword}
      />

      <IconButton
        icon={secureText ? 'eye-off' : 'eye'}
        size={25}
        onPress={toggleSecureText}
        style={styles.icon}
        iconColor="#d3d3d3"
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={signIn}>
        <Text style={[styles.loginButtonText, { color: '#000000' }]}>Sign In</Text>
      </TouchableOpacity>

      {/* OR Divider
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or Continue with</Text>
        <View style={styles.line} />
      </View> */}

      {/* Social Login Options
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={signInWithGoogle}>
          <Image
            source={require('../../assets/images/googlelogo-removebg-preview.png')} // Google logo
            style={styles.googleLogo}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View> */}

      {/* Registration Link */}
      <TouchableOpacity style={styles.registerContainer} onPress={handleNext}>
        <Text style={styles.registerText}>
          New to Flexido?{' '}
          <Text style={styles.registerLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141a20',
    paddingHorizontal: 30,
  },
  eyeIcon: {
    paddingHorizontal: 15,
    position: 'absolute',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 19,
  },
  title: {
    fontSize: 26,
    marginTop: 25,
    marginBottom: 40,
    color: 'white',
    textAlign: 'left',
    fontFamily: 'figtree-semibold'
  },
  input: {
    width: '100%',
    height: 55,
    marginVertical: 10,
    fontFamily: 'figtree-semibold',
    borderBottomWidth: 2,
    borderColor: '#d3d3d3',
    fontSize: 16,
    color: '#f0f0f0'
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginRight: 25,
    transform: [{ translateY: 50 }], // Untuk memposisikan ikon di tengah input
  },
  forgotPassword: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  passwordLink: {
    fontSize: 14,
    color: '#f4ab05',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F4AB05',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  loginButtonText: {
    fontSize: 19,
    fontFamily: 'figtree-semibold'
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#888',
    marginHorizontal: 11,
  },
  orText: {
    color: '#888',
    fontSize: 16,
    fontFamily: 'figtree-regular'
  },
  socialLoginContainer: {
    width: '100%',
    marginTop: 10,
  },
  _socialButton: {
    width: '100%',
    height: 55,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#888',
  },
  get socialButton() {
    return this._socialButton;
  },
  set socialButton(value) {
    this._socialButton = value;
  },
  googleLogo: {
    width: 32,
    height: 32,
    marginRight: 10, // Menambahkan jarak antara logo dan teks
    position: 'absolute',
    left: 10, // Memposisikan logo di sebelah kiri
    borderRadius: 50,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'figtree-semibold'
  },
  registerContainer: {
   top: 35
  },
  registerText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'figtree-semibold',
  },
  registerLink: {
    color: '#F4AB05',
    fontFamily: 'figtree-semibold',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
