import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'react-native-calendars';
import ToDoCard from './TodoCard';
import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";

const CustomCalendar = () => {
    const [notes, setNotes] = useState<any[]>([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

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
            const newNotes = snapshot.docs.map((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate(); // Pastikan createdAt adalah Timestamp Firebase
                const dayName = createdAt
                    ? new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(createdAt)
                    : "Unknown Day";
                return {
                    id: doc.id,
                    ...data,
                    day: dayName, // Nama hari
                    date: createdAt ? createdAt.toISOString().split('T')[0] : null, // Tanggal
                };
            });
            setNotes(newNotes);
        });

        return () => unsubscribe();
    }, []);

    // Atur tampilan DateTimePicker
    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);
    const handleConfirm = (date: any) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    // Grupkan berdasarkan nama hari
    const taskGroup = notes.reduce((acc, task) => {
        const groupKey = task.day || "Unknown Day";
        acc[groupKey] = acc[groupKey] ? [...acc[groupKey], task] : [task];
        return acc;
    }, {});

    const handleSettingsPress = () => {
        alert('Settings clicked');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.containerCalendar}>
                <Text style={styles.label}>Due Date</Text>
                <View style={styles.dateTimeContainer}>
                    <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={showDatePicker} style={styles.timeButton}>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Calendar
                    markedDates={{
                        [selectedDate.toISOString().split('T')[0]]: {
                            selected: true,
                            selectedColor: '#F4AB05',
                        },
                    }}
                    theme={{
                        backgroundColor: '#1A2529',
                        calendarBackground: '#1A2529',
                        textSectionTitleColor: '#b6c1cd',
                        selectedDayBackgroundColor: '#F4AB05',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#F4AB05',
                        dayTextColor: '#ffffff',
                        textDisabledColor: '#d9e1e8',
                        arrowColor: '#F4AB05',
                        monthTextColor: '#F4AB05',
                        textDayFontFamily: 'figtree',
                        textMonthFontFamily: 'figtree',
                        textDayHeaderFontFamily: 'figtree',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                        textDayHeaderFontSize: 14,
                    }}
                    style={styles.calendar}
                />

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
            </View>

            <View style={styles.divider}></View>
            <View style={styles.containerReminder}>
                {Object.keys(taskGroup).map((day) => (
                    <View key={day}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10,color:'#fff' }}>{day}</Text>
                        {taskGroup[day].map((item, index) => (
                            <ToDoCard
                                key={index}
                                title={item.title}
                                time={item.time}
                                description={item.description}
                                onSettingsPress={handleSettingsPress}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#1A2529'
    },
    containerCalendar: {
        padding: 20,
        backgroundColor: '#1A2529',
        borderRadius: 30,
        flex: 1,
        margin: 20,
    },
    label: {
        color: '#fff',
        marginBottom: 10,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateButton: {
        backgroundColor: '#2E3742',
        padding: 10,
        borderRadius: 8,
    },
    timeButton: {
        backgroundColor: '#2E3742',
        padding: 10,
        borderRadius: 8,
    },
    dateText: {
        color: '#F4AB05',
        fontWeight: 'bold',
    },
    calendar: {
        borderRadius: 10,
    },
    divider: {
        height: 2,
        backgroundColor: '#DADADA',
        marginVertical: 10,
    },
    containerReminder: {
        margin: 20,
    },
});

export default CustomCalendar;
