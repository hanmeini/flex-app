import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import { SearchBar } from '@rneui/themed'; 
import TodoCard from './TodoCard'; // Import komponen TodoCard
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const HomeScreen = () => {
  // Data dummy card
  const dataDummy = [
    { id: 1, title: 'Tugas bahasa Indonesia', time: '08.00 - 24.00', description: 'segera kerjakan', date: '2024-11-08' },
    { id: 2, title: 'Tugas matematika', time: '08.00 - 24.00', description: 'persiapan ujian', date: '2024-11-10' },
    { id: 3, title: 'Tugas sejarah', time: '10.00 - 14.00', description: 'baca bab 3', date: '2024-11-08' },
    { id: 4, title: 'Tugas fisika', time: '13.00 - 15.00', description: 'eksperimen', date: '2024-11-01' },
    { id: 5, title: 'Tugas kimia', time: '16.00 - 18.00', description: 'periksa laporan', date: '2024-11-01' },
  ];

  // Ambil tanggal hari ini
  const today = new Date().toISOString().split('T')[0];

  // Filter tugas yang hanya untuk hari ini
  const tasksForToday = dataDummy.filter(task => task.date === today);

  // Fungsi untuk menangani klik pengaturan
  const handleSettingsPress = () => {
    alert('Settings clicked');
  };

  //Profile
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          displayName: currentUser.displayName || 'User',
          photoURL: currentUser.photoURL || 'url_default_gambar'
        });
      } else {
        setUser(null);
      }
    });
    
    // Bersihkan listener ketika komponen di-unmount
    return unsubscribe;
  }, []); 
  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderSection user={user} />

      <ScrollView>
        {/* Progress Section */}
        <ProgressSection />

        {/* Divider */}
        <View style={styles.divider}></View>

        {/* Tugas Hari Ini */}
        <TaskListSection tasks={tasksForToday} onSettingsPress={handleSettingsPress} />
      </ScrollView>
    </View>
  );
};

// Komponen Header
const HeaderSection = ({ user }:any) => (
  <View style={styles.section}>
    <View style={styles.headerContainer}>
      <Image
        source={user && user.photoURL ? { uri: user.photoURL } : require('../../assets/images/WhatsApp Image 2024-09-02 at 11.13.35.jpeg')}
        style={styles.profileImage}
      />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>Hello, {user ? user.displayName : 'User'}!</Text>
        <Text style={styles.subHeaderText}>{user ? user.email : 'View Account'}</Text>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={25} />
      </TouchableOpacity>
    </View>
    <SearchBar placeholder='Type Here...' containerStyle={styles.searchContainer} />
  </View>
);

// Komponen Progress
const ProgressSection = () => (
  <View style={styles.progress}>
    <Text style={styles.progressText}>Progres</Text>
    <View style={styles.progressButtons}>
      <TouchableOpacity style={styles.progressButton}>
        <Text style={styles.progressButtonText}>Harian</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.progressButton}>
        <Text style={styles.progressButtonText}>Mingguan</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.progressContainer}>
      <ProgressBar progress={0.7} color="#1A2529" style={styles.progressBar} />
      <Text style={styles.progressPercentage}>50% selesai</Text>
    </View>
  </View>
);

// Komponen Daftar Tugas
const TaskListSection = ({ tasks, onSettingsPress }:any) => (
  <View style={styles.taskListContainer}>
    <Text style={styles.taskListHeader}>Tugas Hari Ini</Text>
    {tasks.length > 0 ? (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TodoCard
          title={item.title}
          time={item.time}
          description={item.description}
          onSettingsPress={onSettingsPress}
         />
        )}
      />
    ) : (
      <Text style={styles.noTasksText}>Tidak ada tugas untuk hari ini.</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#1A2529',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingTop: 20,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  subHeaderText: {
    color: '#fff',
  },
  notificationButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 80,
  },
  searchContainer: {
    marginTop: 10,
    borderRadius: 30,
  },
  progress: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  progressButton: {
    backgroundColor: '#1A2529',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  progressButtonText: {
    color: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F4AB05',
    marginTop: 10,
    borderRadius: 20,
  },
  progressText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 5,
  },
  progressPercentage: {
    color: '#000',
    marginTop: 5,
  },
  divider: {
    height: 2,
    backgroundColor: '#DADADA',
    marginVertical: 10,
  },
  taskListContainer: {
    padding: 20,
  },
  taskListHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noTasksText: {
    color: 'gray',
  },
});

export default HomeScreen;
