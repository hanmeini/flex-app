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
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";
import { useNavigation } from '@react-navigation/native';
import { format } from "date-fns";



const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [expandedGroups, setExpandedGroups] = useState({
    overdue: false,
    todayTasks: false,
    completedToday: false,
  });

  const navigation = useNavigation();  

  const handleTaskPress = (taskId: any, completed: undefined) => {   
    if (completed) {
      navigation.navigate('TaskDetail', { taskId, canReschedule: true });
    } else {
      navigation.navigate('TaskDetail', { taskId, canReschedule: false });
    }
  };

  const filters = ['All', 'Personal', 'Work', 'Events'];

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore(FIREBASE_APP);

    let unsubscribeNotes;

    // Dengarkan perubahan autentikasi
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        const userNotesCollection = collection(db, `users/${userId}/notes`);
        const q = query(userNotesCollection, orderBy("createdAt", "desc"));

        // Perbarui catatan berdasarkan pengguna yang login
        unsubscribeNotes = onSnapshot(q, (snapshot) => {
          const newTasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(newTasks);
        });
      } else {
        // Jika pengguna logout, kosongkan catatan
        setTasks([]);
      }
    });

    // Bersihkan listener saat komponen tidak aktif
    return () => {
      unsubscribeAuth();
      if (unsubscribeNotes) unsubscribeNotes();
    };
  }, []);

  // Waktu saat ini (dalam format menit)
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentDay = currentTime.getDate();

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

  // Group tasks into Overdue, Today Tasks, and Completed Today
  const groupTasks = () => {
    const overdue: any[] = [];
    const todayTasks: any[] = [];
    const completedToday: any[] = [];

    filteredTasks.forEach((task) => {
      const taskTime = task.time?.toDate();
      const taskDate = task.createdAt?.toDate();
      const isToday = taskDate?.toDateString() === currentTime.toDateString(); // Apakah tugas dibuat hari ini
  
      if (task.completed) {
        if (isToday) {
          completedToday.push(task); // Completed today
        }
      } else {
        if (taskTime) {
          if (taskTime < currentTime) {
            overdue.push(task); // Overdue jika waktu sudah berlalu
          } else if (isToday) {
            todayTasks.push(task); // Today's tasks jika dibuat hari ini dan belum selesai
          }
        } else if (isToday) {
          todayTasks.push(task); // Jika tidak ada `time`, tetap masukkan ke Today Tasks
        }
      }
    });
  
    return { overdue, todayTasks, completedToday };
  };

  const { overdue, todayTasks, completedToday } = groupTasks();

  const noTasksMessage = (
    <View style={styles.noTasksMessageContainer}>
      <Text style={styles.noTasksMessageText}>You don't have any tasks yet.</Text>
    </View>
  );

  const toggleTaskCompletion = async (docId: string, currentStatus: any) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
  
      if (!userId) {
        console.error("User not logged in");
        return;
      }
  
      const db = getFirestore(FIREBASE_APP);
  
      // Gunakan docId sebagai bagian dari path
      const taskRef = doc(db, `users/${userId}/notes/${docId}`);
  
      await updateDoc(taskRef, { completed: !currentStatus });
  
      // Perbarui state lokal
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === docId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };
  
  

  const deleteTask = async (taskId: string) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not logged in");
        return;
      }

      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes, taskId`);

      await deleteDoc(taskRef); 

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

      console.log(`Task with ID ${taskId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const renderTask = ({ item }) => {
    const categoryIcon = 'clipboard-outline';
  
    // Fungsi untuk menentukan warna indikator
    const getIndicatorColor = () => {
      if (item.completed) {
        return "#4CAF50"; // Hijau untuk tugas selesai
      } else if (item.category?.toLowerCase() === 'overdue') {
        return "#FF6B6B"; // Merah untuk overdue
      } else if (item.category?.toLowerCase() === 'today') {
        return "#FFC107"; // Kuning untuk hari ini
      }
      return "#aaa"; // Warna default jika kategori tidak diketahui
    };

    const formatTime = (timestamp) => {
      if (!timestamp?.seconds) return "Unknown Time";
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDayName = (timestamp) => {
      if (!timestamp?.seconds) return "Unknown Day";
      const date = timestamp.toDate();
      return format(date, "EEEE"); // Contoh hasil: "Monday", "Tuesday"
    };
  
    // Validasi dan pemformatan waktu
    let displayTime = item.time;
    if (displayTime?.seconds) {
      displayTime = displayTime.toDate(); // Konversi dari Firestore Timestamp ke JavaScript Date
    }
  
    const formattedDate = getDayName(item.time);
    const formattedTime = formatTime(item.time);
  
    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => handleTaskPress(item.id, item.completed)}
      >
        {/* Indikator Warna */}
        <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
  
        {/* Konten Tugas */}
        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && { textDecorationLine: 'line-through', color: '#999' }, // Gaya untuk tugas selesai
            ]}
          >
            {item.title}
          </Text>
          {/* Informasi Waktu dan Kategori */}
          <View style={styles.timeCategoryContainer}>
            <Text style={styles.taskTime}>{formattedDate}</Text>
            <View style={styles.separatorLine} />
            <Text style={styles.taskTime}>{formattedTime}</Text>
  
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
  
        {/* Tombol Tindakan */}
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
  

  const toggleGroup = (group: string) => {
    setExpandedGroups((prevState) => ({
      ...prevState,
      [group]: !prevState[group],
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
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
          overdue.length === 0 ? noTasksMessage : (
            <FlatList
              data={overdue}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false}
            />
          )
        )}
      </View>

      {/* Today Tasks */}
      <View>
        <TouchableOpacity onPress={() => toggleGroup('todayTasks')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Today Tasks</Text>
          <MaterialCommunityIcons
            name={expandedGroups.todayTasks ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
        {expandedGroups.todayTasks && (
          todayTasks.length === 0 ? noTasksMessage : (
            <FlatList
              data={todayTasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false}
            />
          )
        )}
      </View>

      {/* Completed Today */}
      <View>
        <TouchableOpacity onPress={() => toggleGroup('completedToday')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Completed Today</Text>
          <MaterialCommunityIcons
            name={expandedGroups.completedToday ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
        {expandedGroups.completedToday && (
          completedToday.length === 0 ? noTasksMessage : (
            <FlatList
              data={completedToday}
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
    backgroundColor: '#ffd118',
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
    color: '#fff',
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
    backgroundColor: '#fff',
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