import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIREBASE_APP } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';

// Fungsi untuk memparsing waktu
const parseTime = (time) => {
  const [hours, minutes] = time.split(' ')[0].split(':').map((num) => parseInt(num));
  const isPM = time.includes('PM');
  return isPM ? (hours % 12 + 12) * 60 + minutes : hours * 60 + minutes;
};

const NotesScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [dropdown, setDropdown] = useState({
    inProgress: true,
    completed: true,
    upcoming: true,
  });

  const filters = ['All', 'Personal', 'Work', 'Events'];

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error('User not logged in');
      return;
    }

    const db = getFirestore(FIREBASE_APP);
    const userNotesCollection = collection(db, `users/${userId}/notes`);
    const q = query(userNotesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completed: doc.data().completed || false,
      }));
      setTasks(newTasks);
    });

    return () => unsubscribe();
  }, []);

  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const filterTasks = () => {
    let filteredTasks = tasks;

    if (selectedFilter !== 'All') {
      filteredTasks = filteredTasks.filter((task) => task.category === selectedFilter);
    }

    return filteredTasks;
  };

  const filteredTasks = filterTasks();
  

  const groupTasks = () => {
    const inProgress = [];
    const completed = [];
    const upcoming = [];

    filteredTasks.forEach((task) => {
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

  const deleteTask = async (taskId) => {
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
  
      console.log(`Task ${taskId} deleted`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  

  const { inProgress, completed, upcoming } = groupTasks();

const renderTask = ({ item }: any) => {
  const categoryIcon = 'folder';
  const indicatorColor = item.completed
    ? '#4CAF50' // Hijau untuk Completed
    : parseTime(item.time) > currentMinutes
    ? '#FFEB3B' // Kuning untuk Upcoming
    : '#FF6B6B'; // Merah untuk In Progress

  return (
    <View style={styles.taskCard}>
      <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
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
            <MaterialCommunityIcons name={categoryIcon} size={16} color="#ffff" />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>

      {/* Tombol Delete */}
      {item.completed && (
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <MaterialCommunityIcons name="close" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      )}
    </View>
  );
};


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() =>
              navigation.navigate('CategoryNotes', { category: filter })
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {Object.entries({ inProgress, completed, upcoming }).map(([key, data]) => (
        <View key={key}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown(key)}
          >
            <Text style={styles.groupTitle}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <Ionicons
              name={dropdown[key] ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
          {dropdown[key] && (
            <FlatList
              data={data}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141d20',
    paddingHorizontal: 15,
    paddingTop: 60,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: -150,
  },
  filterTab: {
    width: '48%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2529',
    borderRadius: 10,
    marginBottom: 8,
  },
  activeFilterTab: {
    backgroundColor: '#f4ab05',
  },
  filterText: {
    color: '#666',
    fontSize: 16,
  },
  activeFilterText: {
    color: '#141d20',
  },
  taskList: {
    paddingBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitle: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 10,
    fontFamily: 'figtree-semibold',
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
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  timeCategoryContainer: {
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoryText: {
    color: '#fdfdfd',
    fontSize: 12,
    marginLeft: 5,
  },
  taskTime: {
    color: '#fff',
  },
  completeButton: {
    padding: 10,
  },
});

export default NotesScreen;