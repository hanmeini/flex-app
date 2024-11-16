import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SearchBar } from '@rneui/themed';
import { Icon } from 'react-native-paper';

const tasks = [
  { id: '1', title: 'Client Review & Feedback', project: 'Crypto Wallet Redesign', time: '10:00 PM - 11:45 PM', users: ['user1', 'user2'], status: 'Open' },
  { id: '2', title: 'Create Wireframe', project: 'Crypto Wallet Redesign', time: '09:15 PM - 10:00 PM', users: ['user3', 'user4', 'user5', 'user6'], status: 'Closed' },
  { id: '3', title: 'Design Logo', project: 'Crypto Wallet Redesign', time: '08:00 PM - 09:00 PM', users: ['user1', 'user3'], status: 'Archived' },
  // Add more tasks as needed
];

const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter tasks based on the selected filter
  const filteredTasks = selectedFilter === 'All'
    ? tasks
    : tasks.filter(task => task.status === selectedFilter);

  // Render each task card
  const renderTask = ({ item }:any) => (
    <View style={styles.taskCard}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskProject}>{item.project}</Text>
        <Text style={styles.taskTime}>{item.time}</Text>
      </View>
      <View style={styles.taskActions}>
        <View style={styles.userIcons}>
          {item.users.slice(0, 3).map((user, index) => (
            <Image
              key={index}
              source={{ uri: 'https://via.placeholder.com/30' }} // Replace with user image URIs
              style={styles.userImage}
            />
          ))}
          {item.users.length > 3 && (
            <Text style={styles.moreUsers}>+{item.users.length - 3}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.checkIcon}>
     
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        placeholder="Tasks, events, and more"
        onChangeText={setSearch}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        searchIcon={{ size: 23 }}
      />

      {/* Task Management Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Task</Text>
      </View>

      {/* Interactive Filter Tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Personal', 'Work', 'Events'].map((filter) => (
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

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141d20',
    padding: 15
  },
  searchContainer: {
    backgroundColor: '#141d20',
    paddingTop: 40,
    borderBottomWidth: 0,
    borderTopWidth: 0
  },
  searchInputContainer: {
    backgroundColor: '#1A2529',
    borderRadius: 22,
    width: '100%',
    alignSelf: 'center',
  },
  searchInput: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'figtree'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 15
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'figtree-semibold'
  },
  headerDate: {
    color: '#a0a0a0',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  filterTab: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeFilterTab: {
    backgroundColor: '#F4AB05',
    fontFamily: 'figtree-semibold'
  },
  filterText: {
    color: '#a0a0a0',
    fontFamily: 'figtree'
  },
  activeFilterText: {
    color: '#1A2529',
    fontFamily: 'figtree-semibold'
  },
  taskList: {
    paddingBottom: 20,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1A2529',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskProject: {
    color: '#a0a0a0',
  },
  taskTime: {
    color: '#a0a0a0',
    marginTop: 4,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: -5,
    borderWidth: 2,
    borderColor: '#1A2529',
  },
  moreUsers: {
    color: '#a0a0a0',
    marginLeft: 5,
  },
  checkIcon: {
    padding: 5,
  },
});

export default HomeScreen;
