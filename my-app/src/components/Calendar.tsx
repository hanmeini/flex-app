import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
                const createdAt = data.createdAt?.toDate();
                const dayName = createdAt
                    ? new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(createdAt)
                    : "Unknown Day";
                return {
                    id: doc.id,
                    ...data,
                    day: dayName,
                    date: createdAt ? createdAt.toISOString().split('T')[0] : null,
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

    // Fungsi menambahkan acara ke kalender perangkat
    const addToCalendar = () => {
        const eventConfig = {
            title: 'Custom Event', // Bisa diganti dengan input dari user
            startDate: selectedDate.toISOString(), // Tanggal yang dipilih di kalender
            endDate: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(), // Tambahkan 1 jam
            location: 'Online',
            notes: 'This is a sample event added via CustomCalendar.',
        };

        addEvent(eventConfig)
            .then((eventId) => {
                if (eventId) {
                    Alert.alert('Success', 'Event added to your calendar.');
                } else {
                    Alert.alert('Cancelled', 'Event creation was cancelled.');
                }
            })
            .catch((error) => {
                Alert.alert('Error', `Failed to add event: ${error.message}`);
            });
    };

    // Grupkan berdasarkan nama hari
    const taskGroup = notes.reduce((acc, task) => {
        const groupKey = task.day || "Unknown Day";
        acc[groupKey] = acc[groupKey] ? [...acc[groupKey], task] : [task];
        return acc;
    }, {});

    return (
        <ScrollView style={styles.container}>
            <View style={styles.containerCalendar}>
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
                </View>

                <TouchableOpacity style={styles.addEventButton} onPress={addToCalendar}>
                    <Text style={styles.addEventButtonText}>Add to Calendar</Text>
                </TouchableOpacity>

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
                    onConfirm={handleConfirm }
                    onCancel={hideDatePicker}
                />
            </View>

            <View style={styles.divider}></View>

            <View style={styles.containerReminder}>
                {Object.keys(taskGroup).map((day) => (
                    <View key={day}>
                        <Text style={styles.groupTitle}>{day}</Text>
                        {taskGroup[day].map((item:any) => (
                            <View style={styles.taskCard} key={item.id}>
                                <View style={styles.indicator} />
                                <View style={styles.taskContent}>
                                    <Text style={styles.taskTitle}>{item.title}</Text>
                                    <View style={styles.timeCategoryContainer}>
                                        <Text style={{ color:'#fff' }}>{day}</Text>
                                        <View style={styles.separatorLine} />
                                        <Text style={styles.taskTime}>{item.time}</Text>
                                        <View style={styles.separatorLine} />
                                        <View style={styles.categoryContainer}>
                                            <MaterialCommunityIcons
                                                name="folder"
                                                size={16}
                                                color="#fff"
                                            />
                                            <Text style={styles.categoryText}>
                                                {item.category || "No Category"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#141d20',
        flex: 1,
    },
    containerCalendar: {
        padding: 20,
        backgroundColor: '#141d20',
        borderRadius: 30,
        margin: 20,
    },
    label: {
        color: '#fff',
        marginBottom: 10,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dateButton: {
        backgroundColor: '#2E3742',
        padding: 10,
        borderRadius: 8,
    },
    dateText: {
        color: '#F4AB05',
        fontWeight: 'bold',
    },
    addEventButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F4AB05',
        borderRadius: 10,
    },
    addEventButtonText: {
        color: '#1A2529',
        fontWeight: 'bold',
        textAlign: 'center',
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
    groupTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
    },
    timeCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    taskTime: {
        color: '#999',
        fontSize: 12,
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
    },
    categoryText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 12,
    },
});

export default CustomCalendar;
