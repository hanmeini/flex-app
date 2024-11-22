import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const parseTime = (time) => {
    const [hours, minutes] = time.split(' ')[0].split(':').map(num => parseInt(num));
    const isPM = time.includes('PM');
    return isPM ? (hours % 12 + 12) * 60 + minutes : hours * 60 + minutes;
};

const CategoryNotes = ({ navigation }) => { // Added navigation prop
    const route = useRoute();
    const { category } = route.params; // Parameter kategori dari navigasi
    const [notes, setNotes] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("All");

    const filters = ['All', 'Upcoming', 'In Progress', 'Completed'];

    useEffect(() => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        if (!userId) {
            console.error("User not logged in");
            return;
        }

        const db = getFirestore(FIREBASE_APP);
        const userNotesCollection = collection(db, `users/${userId}/notes`);
        const q = query(userNotesCollection, where("category", "==", category)); // Filter kategori

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const filteredNotes = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotes(filteredNotes);
        });

        return () => unsubscribe();
    }, [category]);

    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Filter tasks based on status
    const filterTasks = () => {
        if (selectedFilter === 'Upcoming') {
            return notes.filter((task) => parseTime(task.time) > currentMinutes && !task.completed);
        } else if (selectedFilter === 'In Progress') {
            return notes.filter((task) => parseTime(task.time) <= currentMinutes && !task.completed);
        } else if (selectedFilter === 'Completed') {
            return notes.filter((task) => task.completed);
        } else if (selectedFilter === 'All') {
            return notes; // No filtering for "All"
        }
        return notes;
    };

    const filteredNotes = filterTasks();

    const renderTask = ({ item }) => {
        const indicatorColor = item.completed
            ? '#4CAF50'
            : parseTime(item.time) > currentMinutes
            ? '#FFA500'
            : '#FF6B6B';

        return (
            <TouchableOpacity 
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} // Navigate to TaskDetail
                style={styles.taskCard}
            >
                <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
                <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, item.completed && { textDecorationLine: 'line-through', color: '#999' }]}>
                        {item.title}
                    </Text>
                    <View style={styles.timeCategoryContainer}>
                        <Text style={styles.taskTime}>{item.time}</Text>
                        <View style={styles.separatorLine} />
                        <View style={styles.categoryContainer}>
                            <MaterialCommunityIcons name="folder" size={16} color="#fff" />
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{category} Notes</Text>
            <View style={styles.filterContainer}>
                {filters.map((filter) => (
                    <Text
                        key={filter}
                        style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]}
                        onPress={() => setSelectedFilter(filter)}
                    >
                        {filter}
                    </Text>
                ))}
            </View>
            <FlatList
                data={filteredNotes}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No notes in this category.</Text>
                }
                contentContainerStyle={styles.taskList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A2529',
        paddingHorizontal: 15,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F4AB05',
        marginBottom: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    filterTab: {
        color: '#ccc',
        fontSize: 16,
        fontWeight: '600',
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#2E3742',
    },
    activeFilterTab: {
        backgroundColor: '#F4AB05',
        color: '#1A2529',
    },
    taskList: {
        paddingBottom: 20,
    },
    taskCard: {
        flexDirection: 'row',
        backgroundColor: '#1A2529',
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
        marginHorizontal: 8,
        backgroundColor: '#666',
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
    emptyText: {
        color: '#ccc',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default CategoryNotes;
