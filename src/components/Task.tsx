import React, { useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { SearchBar } from "@rneui/themed";
import { format } from "date-fns";

const parseTimestamp = (timestamp) => {
  const date = timestamp.toDate(); // Mengonversi Timestamp ke Date JS
  const minutes = date.getHours() * 60 + date.getMinutes(); // Menghitung total menit
  return minutes;
};

const NotesScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [dropdown, setDropdown] = useState({
    inProgress: true,
    completed: true,
    upcoming: true,
  });
  const filters = ["All", "Personal", "Work", "Events"];

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const db = getFirestore(FIREBASE_APP);
    const userNotesCollection = collection(db, `users/${userId}/notes`);
    const q = query(userNotesCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completed: doc.data().completed || false,
      }));
      setTasks(newTasks);
    });

    return () => unsubscribe();
  }, [userId]);

  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const filterTasks = () => {
    let filteredTasks = tasks;

    // Filter berdasarkan kategori
    if (selectedFilter !== "All") {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === selectedFilter
      );
    }

    // Filter berdasarkan pencarian
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.category?.toLowerCase().includes(searchLower)
      );
    }

    return filteredTasks;
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes/${taskId}`);
      await updateDoc(taskRef, { completed: !currentStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes/${taskId}`);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const groupTasks = () => {
    const overdue = [];
    const completed = [];
    const upcoming = [];
    const today = [];
  
    filterTasks().forEach((task) => {
      const taskTime = task.time ? task.time.toDate() : null;
  
      if (task.completed) {
        completed.push(task);
      } else if (taskTime) {
        const isToday =
          taskTime.toDateString() === currentTime.toDateString(); // Cek apakah waktu sesuai hari ini
        if (isToday) {
          today.push(task); // Tambahkan ke kategori Today
        } else if (taskTime > currentTime) {
          upcoming.push(task);
        } else {
          overdue.push(task);
        }
      } else {
        // Tugas tanpa waktu langsung dianggap overdue
        overdue.push(task);
      }
    });
  
    return { overdue, completed, upcoming, today };
  };
  
  const toggleDropdown = (key) => {
    setDropdown((prevState) => ({ ...prevState, [key]: !prevState[key] }));
  };

  const { today, overdue, completed, upcoming } = groupTasks();

  const renderTask = ({ item }) => {
  const taskTime = item.time ? item.time.toDate() : null;
  const categoryIcon = "folder";

  const indicatorColor = item.completed
    ? "#4CAF50" // Hijau untuk tugas selesai
    : taskTime &&
      taskTime.toDateString() === currentTime.toDateString()
    ? "#B0BEC5" // Abu-abu untuk tugas hari ini
    : taskTime && taskTime > currentTime
    ? "#FFEB3B" // Kuning untuk tugas di masa depan
    : "#FF6B6B"; // Merah untuk tugas yang overdue

    // Format tanggal dan waktu
    const formatTime = (timestamp) => {
      if (!timestamp?.seconds) return "Unknown Time";
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    const getDayName = (timestamp) => {
      if (!timestamp?.seconds) return "Unknown Day";
      const date = timestamp.toDate();
      return format(date, "EEEE"); // Contoh hasil: "Monday", "Tuesday"
    };
    let displayTime = item.time;
    if (displayTime?.seconds) {
      displayTime = displayTime.toDate(); // Konversi dari Firestore Timestamp ke JavaScript Date
    }

    const formattedDate = getDayName(item.time);
    const formattedTime = formatTime(item.time);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
      >
        <View style={styles.taskCard}>
          {/* Indikator warna status tugas */}
          <View
            style={[styles.indicator, { backgroundColor: indicatorColor }]}
          />

          {/* Konten utama tugas */}
          <View style={styles.taskContent}>
            {/* Judul tugas */}
            <Text style={styles.taskTitle}>{item.title}</Text>

            {/* Informasi waktu dan kategori */}
            <View style={styles.timeCategoryContainer}>
              <Text style={styles.taskTime}>{formattedDate}</Text>
              <View style={styles.separatorLine} />
              <Text style={styles.taskTime}>{formattedTime}</Text>

              {/* Kategori tugas */}
              <View style={styles.categoryContainer}>
                <MaterialCommunityIcons
                  name={categoryIcon}
                  size={16}
                  color="#ffff"
                />
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>

          {/* Tombol Checklist & Hapus */}
          {/* Checklist untuk tugas yang belum selesai */}
          {!item.completed && (
            <TouchableOpacity
              onPress={() => toggleTaskCompletion(item.id, item.completed)}
            >
              <Ionicons name="ellipse-outline" size={24} color="#DADADA" />
            </TouchableOpacity>
          )}

          {/* Hapus untuk tugas yang selesai */}
          {item.completed && (
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <MaterialCommunityIcons name="close" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
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
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => {
              if (filter !== "All") {
                navigation.navigate("CategoryNotes", { category: filter });
              }
            }}
            disabled={filter === "All"} // Nonaktifkan jika filter adalah "All"
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
                filter === "All" && { color: "#fff" }, // Tambahkan styling untuk All (opsional)
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      {Object.entries({ today, overdue, upcoming, completed }).map(
        ([key, data]) => (
          <View key={key}>
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => toggleDropdown(key)}
            >
              <Text style={styles.groupTitle}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Ionicons
                name={dropdown[key] ? "chevron-down" : "chevron-up"}
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
            {dropdown[key] && (
              <FlatList
                data={data}
                style={styles.flatlist}
                renderItem={renderTask}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.noTasksMessageContainer}>
                    <Text style={styles.noTasksMessageText}>
                      You don't have any tasks yet.
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141d20",
    paddingHorizontal: 17,
    paddingTop: 15,
    fontFamily: "figtree-semibold",
    paddingBottom:60,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: -150,
    fontFamily: "figtree-semibold",
  },
  filterTab: {
    width: "48%",
    fontFamily: "figtree-semibold",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e2b30",
    borderRadius: 10,
    marginBottom: 8,
   
  },
  activeFilterTab: {
    backgroundColor: "#141a20",
    borderWidth: 1,
    borderColor: '#fff'
  },
  filterText: {
    color: "#fff",
    fontSize: 16,
  },
  activeFilterText: {
    color: "#141d20",
  },
  taskList: {
    paddingBottom: 20,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupTitle: {
    color: "#fff",
    fontSize: 18,
    marginVertical: 10,
    fontFamily: "figtree-semibold",
  },
  taskCard: {
    flexDirection: "row",
    backgroundColor: "#1a2529",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
    
  },
  flatlist:{
    marginBottom:60,
  },
  indicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
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
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "figtree-semibold"
  },
  timeCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
  },
  separatorLine: {
    width: 1,
    height: 15,
    backgroundColor: "#666",
    marginHorizontal: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  categoryText: {
    color: "#fdfdfd",
    fontSize: 12,
    marginLeft: 5,
    fontFamily: "figtree"
  },
  taskTime: {
    color: "#fff",
    fontFamily: "figtree"
  },
  completeButton: {
    padding: 10,
  },
  searchContainer: {
    backgroundColor: "#141d20",
    paddingTop: 40,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    marginBottom: 30,
  },
  searchInputContainer: {
    backgroundColor: "#1a2529",
    borderRadius: 22,
    width: "100%",
    alignSelf: "center",
  },
  searchInput: {
    color: "#999",
    fontSize: 16,
    fontFamily: "figtree",
  },
});

export default NotesScreen;
