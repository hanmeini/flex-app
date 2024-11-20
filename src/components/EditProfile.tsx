import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const EditProfile = ({ route, navigation }) => {
  const { userData } = route.params;
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || '');
  const [dob, setDob] = useState(userData?.dob || ''); // Tanggal lahir
  const [phone, setPhone] = useState(userData?.phone || ''); // Nomor telepon

  // Menyimpan data ke Firestore dan memperbarui Auth
  const handleSave = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const firestore = getFirestore();
        const profileRef = doc(firestore, `users/${user.uid}/profile`, 'profileInfo');

        // Update Firebase Auth (opsional, jika ingin menyinkronkan displayName dan photoURL)
        await updateProfile(user, { displayName: fullName, photoURL });

        // Update Firestore di koleksi users/{userId}/profile/profileInfo
        await setDoc(profileRef, {
          fullName,
          photoURL,
          dob,
          phone,
        });

        alert('Profil berhasil diperbarui!');
        // Setelah berhasil disimpan, kita perbarui data profil di input
        navigation.navigate('Profile'); // Navigasi ke halaman Profile
      }
    } catch (error) {
      alert('Gagal memperbarui profil: ' + error.message);
    }
  };

  // Logout fungsi
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      navigation.replace('Login'); // Navigasi ke halaman Login setelah logout
    } catch (error) {
      alert('Gagal logout: ' + error.message);
    }
  };

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

  // Menampilkan data profil yang sudah disimpan dari Firestore
  const fetchUserProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const firestore = getFirestore();
      const profileRef = doc(firestore, `users/${user.uid}/profile`, 'profileInfo');
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setFullName(profileData.fullName);
        setPhotoURL(profileData.photoURL);
        setDob(profileData.dob);
        setPhone(profileData.phone);
      } else {
        console.log('Tidak ada data profil!');
      }
    }
  };

  // Load data profil saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            photoURL
              ? { uri: photoURL }
              : require('../../assets/images/pp-kosong.jpg')
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.datadiri}>Data Pribadi</Text>
      <View style={styles.containerdata}>
        <Text style={styles.kolom}>Nama Lengkap</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#fff"
        />
        <Text style={styles.kolom}>Tanggal Lahir</Text>
        <TextInput
          style={styles.input}
          placeholder="Tanggal Lahir (YYYY-MM-DD)"
          value={dob}
          onChangeText={setDob}
        />
        <Text style={styles.kolom}>Nomor Telepon</Text>
        <TextInput
          style={styles.input}
          placeholder="Nomor Telepon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonSave}>Simpan</Text>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 60,
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
