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
} from 'firebase/firestore';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { ProgressBar } from 'react-native-paper';

const Profile = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState({
    completed: [],
    inProgress: [],
    upcoming: [],
  });
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const db = getFirestore(FIREBASE_APP);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          const tasksRef = collection(db, `users/${userId}/notes`);
          const tasksSnap = await getDocs(tasksRef);

          const allTasks = tasksSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data?.title || 'Tidak Ada Judul',
              description: data?.description || 'Tidak Ada Deskripsi',
              time: data?.time && data.time.toDate ? data.time.toDate() : null, // Pastikan `toDate` hanya dipanggil jika ada
              category: data?.category || 'Tidak Ada Kategori',
              completed: data?.completed || false,
            };
          });

          const completedTasks = allTasks.filter((task) => task.completed);
          const inProgressTasks = allTasks.filter(
            (task) => !task.completed && task.time && task.time < new Date()
          );
          const upcomingTasks = allTasks.filter(
            (task) => task.time && task.time >= new Date()
          );

          setTasks({
            completed: completedTasks,
            inProgress: inProgressTasks,
            upcoming: upcomingTasks,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const filterUpcomingTasks = () => {
    const today = new Date();
    let dateRange: Date | null = null;

    if (selectedFilter === 'Dalam 7 hari') {
      dateRange = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (selectedFilter === 'Dalam 30 hari') {
      dateRange = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    return tasks.upcoming.filter((task) => {
      const dueDate = task.time;
      return dateRange ? dueDate && dueDate <= dateRange : true;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const totalTasks = tasks.completed.length + tasks.inProgress.length;
  const completionProgress = totalTasks
    ? tasks.completed.length / totalTasks
    : 0;
  const inProgressProgress = totalTasks
    ? tasks.inProgress.length / totalTasks
    : 0;

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
        <View>
          <Text style={styles.namaText}>
            {userData?.fullName || 'Nama Tidak Ditemukan'}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.summaryText}>Ringkasan Tugas</Text>
      <View style={styles.taskSummaryContainer}>
        <TaskBox number={tasks.completed.length} label="Tugas Selesai" />
        <TaskBox number={tasks.inProgress.length} label="Tugas Tertunda" />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Progress Penyelesaian</Text>
        <ProgressChart
          progress={completionProgress}
          color="#4caf50"
          label="Selesai"
        />
        <ProgressChart
          progress={inProgressProgress}
          color="#ff9800"
          label="Belum Selesai"
        />
      </View>

      <View style={styles.upcomingDropdownContainer}>
        <Text style={styles.dropdownLabel}>Filter Tugas:</Text>
        <Picker
          selectedValue={selectedFilter}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
        >
          <Picker.Item label="Semua" value="Semua" />
          <Picker.Item label="Dalam 7 hari" value="Dalam 7 hari" />
          <Picker.Item label="Dalam 30 hari" value="Dalam 30 hari" />
        </Picker>

        {selectedFilter !== 'Semua' && (
          <View style={styles.filteredTasksContainer}>
            <Text style={styles.filteredTasksTitle}>
              {selectedFilter === 'Dalam 7 hari'
                ? 'Tugas dalam 7 Hari'
                : 'Tugas dalam 30 Hari'}
            </Text>
            {filterUpcomingTasks().length > 0 ? (
              filterUpcomingTasks().map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDate}>
                    {task.time?.toLocaleDateString('id-ID') || 'Tidak ada tanggal'}
                  </Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noTasksText}>Tidak ada tugas ditemukan.</Text>
            )}
          </View>
        )}
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
  <View>
    <Text style={styles.textchart}>{label}</Text>
    <ProgressBar progress={progress} color={color} style={styles.progressBar} />
  </View>
);

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 25,
    textAlign: 'left',
    color: '#fff',
  },
  taskSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upcomingContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
  },
  taskBox: {
    width: '49%',
    padding: 20,
    backgroundColor: '#1A2529',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
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
  textchart: {
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    marginBottom: 20,
    borderRadius: 20,
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
  upcomingDropdownContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  filteredTasksContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filteredTasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },  
  noTasksText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 10,
  },
});