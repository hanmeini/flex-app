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
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
import { format } from 'date-fns';

const Profile = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]); // Store all tasks in one array
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const db = getFirestore(FIREBASE_APP);

  useEffect(() => {
    const auth = getAuth(FIREBASE_APP);
    const db = getFirestore(FIREBASE_APP);
    let unsubscribeNotes = null;

    // Mengamati perubahan autentikasi
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Pengguna masuk
        const userId = user.uid;

        try {
          // Ambil data profil pengguna
          const profileRef = doc(db, `users/${userId}/profile/profilInfo`);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            setUserData(profileSnap.data());
          } else {
            // Fallback jika data profil tidak ditemukan
            setUserData({
              fullName: user.email, // Gunakan email sebagai nama
              photoURL: '', // Default foto profil kosong
            });
          }

          // Ambil catatan pengguna secara real-time
          const userNotesCollection = collection(db, `users/${userId}/notes`);
          const q = query(userNotesCollection, orderBy("createdAt", "desc"));

          unsubscribeNotes = onSnapshot(q, (snapshot) => {
            const newTasks = snapshot.docs.map((doc) => {
              const data = doc.data();
              console.log('Fetched Task Data:', data); // Debug log
              return {
                id: doc.id,
                ...data,
                time: data.time ? data.time.toDate() : null, // Konversi atau null jika tidak ada
              };
            });
            setTasks(newTasks);
          });          
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // Reset data jika pengguna keluar
        setUserData(null);
        setTasks([]);
      }

      setLoading(false);
    });
        // Cleanup listener autentikasi dan data
        return () => {
          unsubscribeAuth();
          if (unsubscribeNotes) {
            unsubscribeNotes();
          }
        };
      }, []);
  
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const notCompletedTasks = totalTasks - completedTasks;

  const completedProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const notCompletedProgress = totalTasks > 0 ? notCompletedTasks / totalTasks : 0;


  const renderTask = ({ item }) => {
    if (!item) return null; // Tambahkan validasi item
    console.log('Rendering Task:', item);
    const formattedDate = item.time ? format(item.time, 'EEEE') : 'No Date';
    const formattedTime = item.time ? format(item.time, 'HH:mm') : 'No Time';    
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      >
        <View style={styles.taskCard}>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{item.title || 'No Title'}</Text>
            <View style={styles.cardDeskripsi}>
              {/* Render waktu dengan format lokal */}
              <Text style={styles.taskDate}>{formattedDate}</Text>
              <View style={styles.separatorLine} />
              <Text style={styles.taskDate}>{formattedTime}</Text>
              <View style={styles.separatorLine} />
              <Text style={styles.taskCategory}>
                <MaterialCommunityIcons
                  name="folder"
                  size={16}
                  color="#ffff"
                  style={{ marginRight: 2 }}
                />
                {item.category || 'No Category'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const filteredTasks =
  selectedFilter === 'Semua'
    ? tasks
    : tasks.filter((task) => {
        if (!task || !task.time) return false; // Pastikan task dan time ada

        const now = new Date();
        let endRange = null;

        if (selectedFilter === 'Dalam 7 hari') {
          endRange = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (selectedFilter === 'Dalam 30 hari') {
          endRange = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
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

      <Text style={styles.summaryText}>Task Summary</Text>
      <View style={styles.taskSummaryContainer}>
        <TaskBox number={totalTasks} label="Total Task" />
        <TaskBox number={completedTasks} label="Completed" />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily task completion</Text>
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
        <Text style={styles.upcomingTitle}>Note List</Text>
        <Picker
          selectedValue={selectedFilter}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
        >
          <Picker.Item label="All" value="All" /> 
          <Picker.Item label="Hide" value="Dalam 7 hari" />
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
    backgroundColor: '#141a20',
    
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
    fontFamily: "figtree-semibold"
  },
  chartContainer: {
    padding: 17,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 17,
    marginBottom: 10,
    textAlign: 'left',
    fontFamily: "figtree-semibold"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBox: {
    width: '49%',
    padding: 20,
    backgroundColor: '#1a2529',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
  },
  taskNumber: {
    fontSize: 20,
    fontFamily: "figtree-semibold",
    color: '#fff',
  },
  taskLabel: {
    fontSize: 15,
    color: '#fff',
    marginTop: 10,
    fontFamily: "figtree"
  },
  upcomingContainer: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    marginBottom:100,
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
    fontSize: 18,
    marginBottom: 20,
    marginTop: 25,
    textAlign: 'left',    
    color: '#fff',
    fontFamily: "figtree-semibold"
  },
  textchart: {
    marginBottom: 10,
    fontFamily: "figtree"
  },
  progressBar: {
    height: 12,
    marginBottom: 20,
    borderRadius: 20,
  },
  taskSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: "figtree"
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
    fontFamily: "figtree"
  },  
  containernama:{
    flexDirection:'row',
    gap:70,
    justifyContent:'center',
  }
});