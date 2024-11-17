import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import {FIREBASE_AUTH} from '../../FirebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';



const LoginScreen = ({ navigation }:any) => {
  const handleNext = () => {
    navigation.navigate('Register');  // Memastikan navigasi ke layar Login
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const [secureText, setSecureText] = useState(true); // State untuk mengatur secure text


  const signIn = async () => {
    setLoading(true);
    try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        console.log(response);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        setTimeout(() => {
          navigation.navigate("Flexido"); // Arahkan ke Home
        }, 500);
    } catch (error: any) {
        console.log(error);
        alert('Login failed: '+ error.message)
    } finally {
        setLoading(false);
    }
  }

  // Fungsi untuk toggle visibilitas password
  const toggleSecureText = () => {
    setSecureText(!secureText);
  };


 
  
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/images/logo (2).png')} style={styles.logo} />

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
          icon={secureText ? "eye-off" : "eye"}
          size={25}
          onPress={toggleSecureText}
          style={styles.icon}
          iconColor='#d3d3d3'
        />

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={signIn}>
        <Text style={[styles.loginButtonText, { color: '#000000' }]}>Sign In</Text>
      </TouchableOpacity>

      {/* OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or Continue with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Login Options */}
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require('../../assets/images/googlelogo-removebg-preview.png')} // Ganti dengan path logo Google
            style={styles.googleLogo}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

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
    transform: [{ translateY: -14 }], // Untuk memposisikan ikon di tengah input
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
