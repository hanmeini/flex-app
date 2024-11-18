import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SearchBar } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";
import { useNavigation } from '@react-navigation/native';

// Fungsi untuk memparsing waktu
const parseTime = (time: { split: (arg0: string) => { split: (arg0: string) => { (): any; new(): any; map: { (arg0: (num: any) => number): [any, any]; new(): any; }; }; }[]; includes: (arg0: string) => any; }) => {
  const [hours, minutes] = time.split(' ')[0].split(':').map((num: string) => parseInt(num));
  const isPM = time.includes('PM');
  return isPM ? (hours % 12 + 12) * 60 + minutes : hours * 60 + minutes;
};

const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [expandedGroups, setExpandedGroups] = useState({
    overdue: false,
    completed: false,
    upcoming: false,
  });

  const navigation = useNavigation();  

  const handleTaskPress = (taskId: any, completed: undefined) => {   
    if (completed) {
      // Jika tugas sudah selesai, beri opsi untuk mereschedule
      navigation.navigate('TaskDetail', { taskId, canReschedule: true });
    } else {
      // Jika tugas belum selesai, arahkan ke detail task
      navigation.navigate('TaskDetail', { taskId, canReschedule: false });
    }
  };
  // Filters untuk kategori
  const filters = ['All', 'Personal', 'Work', 'Events'];

  // Ambil data dari Firestore
  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    const db = getFirestore(FIREBASE_APP);
    const userNotesCollection = collection(db, `users/${userId}/notes`);
    const q = query(userNotesCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(newTasks);
    });

    return () => unsubscribe();
  }, []);

  // Waktu saat ini (dalam format menit)
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Filter tugas berdasarkan kategori dan pencarian
  const filterTasks = () => {
    let filteredTasks = tasks;

    if (selectedFilter !== 'All') {
      filteredTasks = filteredTasks.filter((task) => task.category === selectedFilter);
    }

    if (search.trim() !== '') {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filteredTasks;
  };

  const filteredTasks = filterTasks();

  // Fungsi untuk mengelompokkan tugas
  const groupTasks = () => {
    const inProgress: never[] = [];
    const completed: never[] = [];
    const upcoming: never[] = [];

    filteredTasks.forEach(task => {
      const taskTime = parseTime(task.time);

      if (task.completed) {
        completed.push(task);
      } else if (taskTime > currentMinutes) {
        upcoming.push(task);
      } else {
        inProgress.push(task);
      }
    });

    return { inProgress, completed, upcoming };
  };

  const { inProgress, completed, upcoming } = groupTasks();

  // Cek jika ada tugas untuk ditampilkan
  const noTasksMessage = (
    <View style={styles.noTasksMessageContainer}>
      <Text style={styles.noTasksMessageText}>You don't have any tasks yet.</Text>
    </View>
  );

  // Toggle status tugas (centang/ubah status di Firestore)
  const toggleTaskCompletion = async (taskId: string, currentStatus: any) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not logged in");
        return;
      }

      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes`, taskId);

      // Update status di Firestore
      await updateDoc(taskRef, { completed: !currentStatus });

      // Perbarui status di state lokal
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  // Fungsi untuk menghapus tugas
  const deleteTask = async (taskId: string) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not logged in");
        return;
      }

      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes`, taskId);

      await deleteDoc(taskRef); // Hapus dokumen dari Firestore

      // Hapus tugas dari state lokal
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

      console.log(`Task with ID ${taskId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Render tugas
  const renderTask = ({ item }) => {
    const categoryIcon = 'clipboard-outline';

    const getIndicatorColor = () => {
      if (item.completed) return "#4CAF50"; // Hijau untuk tugas yang selesai
      const taskTime = parseTime(item.time);
      return taskTime > currentMinutes ? "#FFC107" : "#FF6B6B"; // Kuning untuk tugas mendatang, merah untuk overdue
    };

    return (
      <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item.id, item.completed)}  // Tambahkan flag completed
    >
        <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />

        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && { textDecorationLine: 'line-through', color: '#999' },
            ]}
          >
            {item.title}
          </Text>

          <View style={styles.timeCategoryContainer}>
            <Text style={styles.taskTime}>Today</Text>
            <View style={styles.separatorLine} />
            <Text style={styles.taskTime}>{item.time}</Text>

            <View style={styles.categoryContainer}>
              <View style={styles.verticalSeparator} />
              <MaterialCommunityIcons
                name={categoryIcon}
                size={16}
                color="#ffff"
              />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        </View>

        {item.completed ? (
          <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.checkIcon}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="#FF6B6B"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.completed)} style={styles.checkIcon}>
            <MaterialCommunityIcons
              name="circle-outline"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

        )}
      </TouchableOpacity>
    );
  };

  // Fungsi untuk toggle dropdown
  const toggleGroup = (group: string) => {
    setExpandedGroups((prevState) => ({
      ...prevState,
      [group]: !prevState[group],
    }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <SearchBar
        placeholder="Tasks, events, and more"
        onChangeText={setSearch}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        searchIcon={{ size: 23 }}
      />

      <View style={styles.filterContainer}>
        {filters.map((filter, index) => (
          <React.Fragment key={filter}>
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
            {index < filters.length - 1 && <View style={styles.filterSeparator} />}
          </React.Fragment>
        ))}
      </View>

      {/* Overdue */}
      <View>
        <TouchableOpacity onPress={() => toggleGroup('overdue')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Overdue</Text>
          <MaterialCommunityIcons
            name={expandedGroups.overdue ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
        {expandedGroups.overdue && (
          inProgress.length === 0 ? noTasksMessage : (
            <FlatList
              data={inProgress}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false}
            />
          )
        )}
      </View>

      {/* Completed */}
      <View>
        <TouchableOpacity onPress={() => toggleGroup('completed')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Completed</Text>
          <MaterialCommunityIcons
            name={expandedGroups.completed ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
        {expandedGroups.completed && (
          completed.length === 0 ? noTasksMessage : (
            <FlatList
              data={completed}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false}
            />
          )
        )}
      </View>

      {/* Upcoming */}
      <View>
        <TouchableOpacity onPress={() => toggleGroup('upcoming')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Upcoming</Text>
          <MaterialCommunityIcons
            name={expandedGroups.upcoming ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
        {expandedGroups.upcoming && (
          upcoming.length === 0 ? noTasksMessage : (
            <FlatList
              data={upcoming}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false}
            />
          )
        )}
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141d20',
    padding: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 6,
  },
  noTasksMessageContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noTasksMessageText: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'figtree-semibold',
    marginTop: 15,
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#141d20',
    paddingTop: 40,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  searchInputContainer: {
    backgroundColor: '#1a2529',
    borderRadius: 22,
    width: '100%',
    alignSelf: 'center',
  },
  searchInput: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'figtree',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 14,
  },
  filterTab: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeFilterTab: {
    backgroundColor: '#f4ab05',
  },
  filterText: {
    color: '#666',
    fontFamily: 'figtree-semibold',
  },
  activeFilterText: {
    color: '#141d20',
  },
  taskList: {
    paddingBottom: 20,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1a2529',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  indicator: {
    width: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
    marginRight: 12,
    height: '100%'
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'figtree-semibold',
  },
  taskTime: {
    color: '#999',
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'figtree-semibold',
  },
  checkIcon: {
    padding: 8,
  },
  timeCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  separatorLine: {
    width: 1,
    height: 15,
    marginTop: 2,
    backgroundColor: '#666',
    marginHorizontal: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,  // Adds some space between time and category
  },
  categoryText: {
    color: '#fdfdfd',
    fontSize: 12,
    marginLeft: 5,
  },
  groupTitle: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 10,
    fontFamily: 'figtree-semibold',
  },
  verticalSeparator: {
    width: 1,
    height: 15, // Sesuaikan tinggi garis
    backgroundColor: '#666', // Warna garis
    marginRight: 8, // Jarak garis ke ikon kategori
  },
  filterSeparator: {
    width: 1, // Lebar garis separator
    height: '60%', // Tinggi garis
    backgroundColor: '#444', // Warna separator
    alignSelf: 'center', // Posisikan separator di tengah secara vertikal
    marginHorizontal: 10, // Jarak antara filter dan separator
  },
  // Gaya untuk grup header
  groupHeader: {
    flexDirection: 'row',   // Mengatur grup header menjadi baris
    justifyContent: 'space-between', // Menyebarkan elemen ke kedua sisi
    alignItems: 'center',   // Menyusun elemen secara vertikal sejajar
    paddingVertical: 10,
  },
  // Gaya untuk ikon chevron (panah)
  chevronIcon: {
    marginLeft: 10,   // Memberikan sedikit jarak antara teks dan ikon
  },
  
});

export default HomeScreen;