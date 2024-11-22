import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const Profile = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]); // Store all tasks in one array
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const db = getFirestore(FIREBASE_APP);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null; // Variabel untuk fungsi unsubscribe
  
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (user) {
          const userId = user.uid;
  
          // Ambil data profil dari Firestore
          const profileRef = doc(db, `users/${userId}/profile/profilInfo`);
          const profileSnap = await getDoc(profileRef);
  
          // Set data profil ke state
          if (profileSnap.exists()) {
            setUserData(profileSnap.data());
          } else {
            setUserData({
              fullName: user.email, // Gunakan email sebagai fallback nama
              photoURL: '', // Default foto profil kosong
            });
          }
  
          // Ambil data catatan secara real-time
          const userNotesCollection = collection(db, `users/${userId}/notes`);
          const q = query(userNotesCollection, orderBy('createdAt', 'desc'));
  
          // Daftar listener real-time Firestore
          unsubscribe = onSnapshot(q, (snapshot) => {
            const newTasks = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || 'No Title',
                description: data.description || 'No Description',
                time: data.time || 'No Time', // Tetap sebagai string
                category: data.category || 'No Category',
                completed: data.completed || false,
              };
            });
            setTasks(newTasks); // Simpan data ke state
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  
    // Cleanup listener saat komponen unmount
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Pastikan listener dihentikan
      }
    };
  }, []); // Hanya dipanggil saat pertama kali render
  
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const notCompletedTasks = totalTasks - completedTasks;

  const completedProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const notCompletedProgress = totalTasks > 0 ? notCompletedTasks / totalTasks : 0;


  const renderTask = (item:any) => (
    <View key={item.id} style={styles.taskCard}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title || "Title Empty"}</Text>
        <View style={styles.cardDeskripsi}>
          <Text style={styles.taskDate}>
             {item.time}
          </Text>
          <View style={styles.separatorLine} />
          <Text style={styles.taskCategory}>
            <MaterialCommunityIcons name='folder' size={16} color="#ffff" style={{ marginRight:2 }} /> 
            {item.category}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const filteredTasks = selectedFilter === 'Semua'
  ? tasks
  : tasks.filter((task) => {
      if (!task.time) return false; // Abaikan catatan tanpa waktu

      const now = new Date().toISOString(); // String waktu saat ini
      let endRange = null;

      if (selectedFilter === 'Dalam 7 hari') {
        endRange = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (selectedFilter === 'Dalam 30 hari') {
        endRange = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      return endRange ? task.time >= now && task.time <= endRange : true;
    });



  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => navigation.navigate('EditProfile', { userData })}
      >
        <Image
          source={
            userData?.photoURL
              ? { uri: userData.photoURL }
              : require('../../assets/images/pp-kosong.jpg')
          }
          style={styles.profileImage}
        />
        <View style={styles.containernama}>
          <Text style={styles.namaText}>
            {userData?.fullName || 'Profile'}
          </Text>
          <Ionicons name='chevron-forward-outline' size={25}/>
        </View>
      </TouchableOpacity>

      <Text style={styles.summaryText}>Ringkasan Tugas</Text>
      <View style={styles.taskSummaryContainer}>
        <TaskBox number={totalTasks} label="Total Task" />
        <TaskBox number={completedTasks} label="Completed" />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Progress Penyelesaian</Text>
        <ProgressChart
          progress={completedProgress}
          color="#4caf50"
          label="Completed"
        />
        <ProgressChart
          progress={notCompletedProgress}
          color="#FF6B6B"
          label="Not Completed"
        />
      </View>

       <View style={styles.upcomingContainer}>
        <Text style={styles.upcomingTitle}>Daftar Notes</Text>
        <Picker
          selectedValue={selectedFilter}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
        >
          <Picker.Item label="Semua" value="Semua" />
          <Picker.Item label="Dalam 7 hari" value="Dalam 7 hari" />
          <Picker.Item label="Dalam 30 hari" value="Dalam 30 hari" />
        </Picker>

        {filteredTasks.map((note) => renderTask(note))}
      </View>
    </ScrollView>
  );
};

const TaskBox = ({ number, label }: { number: number; label: string }) => (
  <View style={styles.taskBox}>
    <Text style={styles.taskNumber}>{number}</Text>
    <Text style={styles.taskLabel}>{label}</Text>
  </View>
);

const ProgressChart = ({
  progress,
  color,
  label,
}: {
  progress: number;
  color: string;
  label: string;
}) => (
  <View style={styles.progressChartContainer}>
    <View style={styles.progressBarLabel}>
      <Text style={styles.textchart}>{label}</Text>
      <Text style={styles.percentageText}>{Math.round(progress * 100)}%</Text>
    </View>
    <ProgressBar progress={progress} color={color} style={styles.progressBar} />
  </View>
);


export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1A2529',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 40,
    marginRight: 20,
  },
  namaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  chartContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBox: {
    width: '49%',
    padding: 20,
    backgroundColor: '#28393F',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DADADA',
  },
  taskNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  upcomingContainer: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1a2529',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  cardDeskripsi: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  separatorLine: {
    width: 1,
    height: 15,
    backgroundColor: '#666',
    marginHorizontal: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskDate: {
    fontSize: 14,
    color: '#fff',
  },
  taskDescription: {
    fontSize: 14,
    color: '#fff',
  },
  taskCategory: {
    fontSize: 14,
    color: '#fff',
  },
  summaryText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 25,
    textAlign: 'left',
    color: '#fff',
  },
  textchart: {
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    marginBottom: 20,
    borderRadius: 20,
  },
  taskSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskContent: {
    flex: 1,
  },
  progressChartContainer: {
    marginVertical: 10,
  },
  progressBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
  },  
  containernama:{
    flexDirection:'row',
    gap:70,
    justifyContent:'center',
  }
});