import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchBar } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Data awal
const initialTasks = [
  { id: '1', title: 'Meeting with Client', time: '11:25 PM', completed: false, category: 'Work' },
  { id: '2', title: 'Create Wireframe', time: '09:15 PM', completed: true, category: 'Work' },
  { id: '3', title: 'Design Logo', time: '08:00 PM', completed: false, category: 'Personal' },
  { id: '4', title: 'Plan Birthday Party', time: '07:00 PM', completed: false, category: 'Events' },
];

// Fungsi untuk memparsing waktu
const parseTime = (time) => {
  const [hours, minutes] = time.split(' ')[0].split(':').map(num => parseInt(num));
  const isPM = time.includes('PM');
  return isPM ? (hours % 12 + 12) * 60 + minutes : hours * 60 + minutes;
};

const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [tasks, setTasks] = useState(initialTasks);

  const filters = ['All', 'Personal', 'Work', 'Events'];

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
    const inProgress = [];
    const completed = [];
    const upcoming = [];

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

  // Toggle status tugas
  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Render tugas
 const renderTask = ({ item }) => {
  // Menentukan ikon berdasarkan kategori
  let categoryIcon;
  switch (item.category) {
    case 'Work':
      categoryIcon = 'briefcase';
      break;
    case 'Personal':
      categoryIcon = 'account';
      break;
    case 'Events':
      categoryIcon = 'calendar';
      break;
    default:
      categoryIcon = 'folder'; // Default icon
  }

  return (
    <View style={styles.taskCard}>
      <View style={styles.indicator} />
      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            item.completed && { textDecorationLine: 'line-through', color: '#999' },
          ]}
        >
          {item.title}
        </Text>

        {/* Gabungkan waktu dan kategori dalam satu baris */}
        <View style={styles.timeCategoryContainer}>
          <Text style={styles.taskTime}>Today</Text>
          <View style={styles.separatorLine} />
          <Text style={styles.taskTime}>{item.time}</Text>

          <View style={styles.categoryContainer}>
            <MaterialCommunityIcons   
              name={categoryIcon}
              size={15}
              color="#ffff"
            />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.checkIcon}>
        <MaterialCommunityIcons
          name={item.completed ? 'close-circle' : 'circle-outline'}
          size={24}
          color={item.completed ? '#FF6B6B' : '#ffff'}
        />
      </TouchableOpacity>
    </View>
  );
};

  return (
    <View style={styles.container}>
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
            style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grup In Progress */}
      <View>
        <Text style={styles.groupTitle}>In Progress</Text>
        <FlatList
          data={inProgress}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
        />
      </View>

      {/* Grup Completed */}
      <View>
        <Text style={styles.groupTitle}>Completed</Text>
        <FlatList
          data={completed}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
        />
      </View>

      {/* Grup Upcoming */}
      <View>
        <Text style={styles.groupTitle}>Upcoming</Text>
        <FlatList
          data={upcoming}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
        />
      </View>
    </View>
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
    fontSize: 12,
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
});

export default HomeScreen;