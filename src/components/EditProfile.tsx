import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_APP, FIREBASE_AUTH } from '../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const EditProfile = ({ route, navigation }: any) => {
  const { userData } = route.params;
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || '');
  const [dob, setDob] = useState(userData?.dob || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  // Fungsi untuk mengambil gambar dari galeri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  // Fungsi mengambil data profil dari Firestore
  const fetchUserProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      navigation.replace('Login');
      return;
    }

    setLoading(true);
    try {
      const profileRef = doc(firestore, `users/${user.uid}/profile`, '8Js4h1TvZBMGR6MngvLg');
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setFullName(profileData.fullName);
        setPhotoURL(profileData.photoURL);
        setDob(profileData.dob);
        setPhone(profileData.phone);
      } else {
        console.log('No profile data found');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Menyimpan data ke Firestore dan memperbarui Auth
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
  
      if (user) {
        const userId = user.uid;
  
        // Referensi dokumen profile
        const profileRef = doc(firestore, `users/${userId}/profile/8Js4h1TvZBMGR6MngvLg`);
        
        // Periksa apakah dokumen sudah ada
        const profileSnap = await getDoc(profileRef);
  
        if (profileSnap.exists()) {
          // Jika dokumen ada, perbarui dengan updateDoc
          await updateDoc(profileRef, {
            photoURL,
            fullName,
            dob,
            phone,
          });
        } else {
          // Jika dokumen tidak ada, buat dokumen baru dengan setDoc
          await setDoc(profileRef, {
            photoURL,
            fullName,
            dob,
            phone,
          });
        }
  
        // Navigasi kembali ke halaman Profile
        navigation.navigate('Profile', { updatedPhotoURL: photoURL });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };
  
  

  const handleLogout = async () => {
    try {
        await FIREBASE_AUTH.signOut(); // Logout dari Firebase
        await AsyncStorage.removeItem('loggedInUser'); // Hapus user dari AsyncStorage
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Arahkan ke Login
    } catch (error) {
        console.error('Logout Error:', error);
        alert('Logout failed: ' + error.message);
    }
};

  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }
  

  return (
    <View style={styles.container}>
     <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
        <Image
          source={
            photoURL
              ? { uri: photoURL }
              : require('../../assets/images/pp-kosong.jpg')
          }
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIconContainer} onPress={pickImage}>
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
      <Text style={styles.datadiri}>Personal Data</Text>
      <View style={styles.containerdata}>
        <Text style={styles.kolom}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#fff"
        />
        <Text style={styles.kolom}>Date Of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="Tanggal Lahir (YYYY-MM-DD)"
          value={dob}
          onChangeText={setDob}
        />
        <Text style={styles.kolom}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Nomor Telepon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonSave}>Save</Text>
          <AntDesign name="checkcircle" size={24} color="#F4AB05" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonLogout}>Logout</Text>
          <MaterialIcons name="logout" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfile;

// Gaya
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    padding: 30,
    backgroundColor: '#1A2529',
  },
  profileImageContainer: {
    position: 'relative', // Container relatif terhadap posisi internal elemen
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  profileImage: {
    width: 120, // Ukuran gambar profil
    height: 120,
    borderRadius: 60, // Membuat gambar berbentuk lingkaran
  },
  editIconContainer: {
    position: 'absolute', // Menempatkan ikon secara absolut
    bottom: 0, // Pastikan ikon berada tepat di bawah
    right: 120, // Ikon berada di kanan
    backgroundColor: '#F4AB05', // Warna latar belakang ikon
    padding: 8, // Padding di sekitar ikon
    borderRadius: 16, // Membuat lingkaran sempurna
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Efek bayangan untuk Android
    shadowColor: '#000', // Efek bayangan untuk iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  containerdata: {
    padding: 10,
  },
  datadiri: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  kolom: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  buttonLogout: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSave: {
    fontSize: 16,
    fontWeight: '600',
  },
});
