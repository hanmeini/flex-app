import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIREBASE_APP } from '../../FirebaseConfig';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId, canReschedule } = route.params;  // Get taskId and reschedule flag from route params
  const [task, setTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);  // To control the visibility of DateTimePicker
  const [newTime, setNewTime] = useState(new Date());  // State to hold the selected time
  const [timeSet, setTimeSet] = useState(false);  // To track whether the time has been updated

  useEffect(() => {
    const fetchTaskDetail = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error('User not logged in');
        return;
      }

      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes`, taskId);
      const taskSnap = await getDoc(taskRef);

      if (taskSnap.exists()) {
        setTask(taskSnap.data());
      } else {
        console.log('No such task!');
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  // Function to format time to HH:mm
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;  // Format as HH:mm
  };

  // Function to handle rescheduling the task
  const handleReschedule = async () => {
    if (!task) return;

    // Format the new time as string
    const formattedTime = formatTime(newTime);  // Use the formatTime function to format the time

    const db = getFirestore(FIREBASE_APP);
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    const taskRef = doc(db, `users/${userId}/notes`, taskId);

    try {
      await updateDoc(taskRef, {
        completed: false,  // Reset completed status
        time: formattedTime,  // Update task time
      });

      // Update local state to reflect the new time
      setTask(prevTask => ({
        ...prevTask,
        completed: false,
        time: formattedTime,
      }));

      setTimeSet(true);  // Mark time as set
      Alert.alert('Task Rescheduled', `Your task has been rescheduled to ${formattedTime}`);
    } catch (error) {
      console.error('Error rescheduling task:', error);
      Alert.alert('Error', 'There was an issue rescheduling the task.');
    }

    // Hide the DateTimePicker after saving
    setShowDatePicker(false);  
  };

  // Function to handle canceling the time change
  const handleCancel = () => {
    setShowDatePicker(false);  // Hide the DateTimePicker without making any changes
    setNewTime(new Date());  // Reset the selected time to the original task time
  };

  // Function to handle the change in time
  const handleTimeChange = (event, selectedDate) => {
    if (event.type === 'set') {
      // If a new date is set, update the time
      setNewTime(selectedDate || newTime);
      setShowDatePicker(false); // Close the picker once the time is set
    }
    if (event.type === 'dismissed') {
      // If the user dismisses the picker, close it
      setShowDatePicker(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.category}>Category: {task.category}</Text>
      <Text style={styles.time}>Time: {task.time}</Text>
      <Text style={styles.description}>Description: {task.description || 'No description provided'}</Text>

      {/* Show "Reschedule" option only if the task is completed and time is not set yet */}
      {canReschedule && task.completed && !timeSet && (
        <View>
          <TouchableOpacity
            style={styles.rescheduleButton}
            onPress={() => setShowDatePicker(true)}  // Show DateTimePicker
          >
            <Text style={styles.rescheduleText}>Reschedule Task</Text>
          </TouchableOpacity>

          {/* Show DateTimePicker if showDatePicker is true */}
          {showDatePicker && (
            <DateTimePicker
              value={newTime}
              mode="time"
              is24Hour={true}
              onChange={handleTimeChange}  // Handle time change and cancellation
            />
          )}

          {/* Show "Save New Time" button only if DateTimePicker is shown */}
          {showDatePicker && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleReschedule}  // Save the new time and hide the picker
              >
                <Text style={styles.saveText}>Save New Time</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}  // Cancel the operation and hide the picker
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* If the time is set, display a message that the task has been rescheduled */}
      {timeSet && (
        <View style={styles.rescheduledMessage}>
          <Text style={styles.rescheduledText}>Task has been successfully rescheduled!</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.goBackText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 18,
    marginTop: 10,
  },
  time: {
    fontSize: 16,
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    marginTop: 10,
  },
  rescheduleButton: {
    backgroundColor: '#ffab00',
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
  },
  rescheduleText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    marginTop: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    marginTop: 10,
    borderRadius: 5,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: '#ddd',
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
  },
  goBackText: {
    textAlign: 'center',
    fontSize: 18,
  },
  rescheduledMessage: {
    marginTop: 20,
  },
  rescheduledText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
  },
});

export default TaskDetailScreen;
