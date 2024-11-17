// src/screens/TaskDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskDetailScreen = ({route, navigation}) => {

    const { task } = route.params; // 

    const { taskId } = route.params; // Get the task ID passed via navigation
    
    const [taskDetails, setTaskDetails] = useState(null);

    useEffect(() => {
        // Fetch task details based on taskId from AsyncStorage or a database
        const fetchTaskDetails = async () => {
            try {
                // Assuming tasks are stored as JSON array in AsyncStorage
                const tasksData = await AsyncStorage.getItem('tasks');
                const tasks = tasksData ? JSON.parse(tasksData) : [];

                const task = tasks.find(task => task.id === taskId); // Find task by ID
                setTaskDetails(task);
            } catch (error) {
                console.error('Error fetching task details:', error);
            }
        };

        fetchTaskDetails();
    }, [taskId]);

    if (!taskDetails) {
        return <Text>Loading...</Text>; // Loading state
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{taskDetails.title}</Text>
            <Text style={styles.description}>{taskDetails.description}</Text>
            <Text style={styles.date}>Due Date: {taskDetails.dueDate}</Text>
            <Text style={styles.status}>Status: {taskDetails.status}</Text>
            
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 15,
    },
    date: {
        fontSize: 14,
        marginBottom: 10,
    },
    status: {
        fontSize: 14,
        marginBottom: 20,
    },
});

export default TaskDetailScreen;



