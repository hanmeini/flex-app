import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FIREBASE_APP } from '../../FirebaseConfig';

const Task = ({ navigation }: any) => {
  const [notes, setNotes] = useState<any[]>([]);

  // Fetch notes from Firestore
  useEffect(() => {
    const db = getFirestore(FIREBASE_APP);
    const notesCollection = collection(db, 'notes');
    const q = query(notesCollection, orderBy('createdAt', 'desc')); // Sort by creation date

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes); // Set notes data to state
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notes.map((note) => (
          <View key={note.id} style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={30} color="#fff" />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{note.title}</Text>
              <Text style={styles.time}>{note.time}</Text>
              {note.description && <Text style={styles.description}>{note.description}</Text>}
            </View>
            <TouchableOpacity onPress={() => console.log("Settings pressed")} style={styles.settingsIcon}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Note')}
      >
        <Ionicons name="add-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Add some padding to the bottom for space
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A2529',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    backgroundColor: '#F4AB05',
    borderRadius: 10,
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    color: '#bbb',
    fontSize: 14,
  },
  description: {
    color: '#bbb',
    fontSize: 12,
  },
  settingsIcon: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 15,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#F4AB05', // Color button theme
    borderRadius: 15,
    padding: 17,
    elevation: 5, // Add shadow for floating effect
  },
});
