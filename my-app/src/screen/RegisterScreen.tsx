import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, Alert } from 'react-native';
import { IconButton } from "react-native-paper";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

const RegisterScreen = ({ navigation }:any) => {
  const handleNext = () => {
    navigation.navigate("Login"); // Memastikan navigasi ke layar Login
  };
  const handleLogin = ({ navigation }:any) => {
    navigation.navigate("Login");
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const [secureText, setSecureText] = useState(true); // State untuk mengatur secure text
  const [modalVisible, setModalVisible] = useState(false); // State untuk mengatur visibilitas Modal

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);
      setModalVisible(true); // Tampilkan modal
      setTimeout(() => {
        setModalVisible(false); // Sembunyikan modal setelah 2 detik
        navigation.navigate('Home'); // Arahkan ke Home
      }, 2000);
    } catch (error: any) {
      console.log(error);
      alert('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/logo (2).png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Join Flexido Now.</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email} // Tambahkan ini
          onChangeText={(text) => setEmail(text)} // Tambahkan ini
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          autoCapitalize="none"
          secureTextEntry={secureText} // Menambah keamanan input password
          value={password} // Tambahkan ini
          onChangeText={(text) => setPassword(text)} // Tambahkan ini
        />
      </View>

      <IconButton size={25} style={styles.icon} iconColor="#d3d3d3" />

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton} onPress={signUp}>
        <Text style={styles.registerButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or Sign Up with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Login Options */}
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/images/googlelogo-removebg-preview.png")} // Ganti dengan path logo Google
            style={styles.googleLogo}
          />
          <Text style={styles.socialButtonText}>Sign Up with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Registration Link */}
      <TouchableOpacity style={styles.registerContainer} onPress={handleNext}>
        <Text style={styles.registerText}>
          Ever used Flexido? <Text style={styles.registerLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
       {/* Modal untuk popup sukses */}
       <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Signup Successful!</Text>
            <Text style={styles.modalSubText}>Welcome to Flexido</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A2529",
    paddingHorizontal: 35,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 250,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2529',
    marginBottom: 5,
  },
  modalSubText: {
    fontSize: 16,
    color: '#666',
  },
  icon: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginRight: 25,
    transform: [{ translateY: 0 }], // Untuk memposisikan ikon di tengah input
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    marginTop: 30,
    marginBottom: 40,
    color: "white",
    fontFamily: "figtree-semibold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
    marginLeft: 20,
  },
  input: {
    width: "100%",
    height: 55,
    borderBottomWidth: 2,
    borderColor: "#d3d3d3",
    fontSize: 16,
    color: "#f0f0f0",
    fontFamily: "figtree-semibold",
  },
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#F4AB05",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  registerButtonText: {
    fontSize: 19,
    color: "#000000",
    fontFamily: "figtree-semibold",
  },
  registerContainer: {
    marginTop: 26,
  },
  registerText: {
    fontSize: 16,
    fontFamily: "figtree-semibold",
    color: "#fff",
  },
  registerLink: {
    color: "#F4AB05",
    fontFamily: "figtree-semibold",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#888",
    marginHorizontal: 10,
  },
  orText: {
    color: "#888",
    fontSize: 16,
    fontFamily: "figtree-regular",
  },
  socialLoginContainer: {
    width: "100%",
    marginTop: 10,
  },
  _socialButton: {
    width: "100%",
    height: 55,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    marginVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#888",
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
    position: "absolute",
    left: 10, // Memposisikan logo di sebelah kiri
    borderRadius: 50,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "figtree-semibold",
  },
});

export default RegisterScreen;
