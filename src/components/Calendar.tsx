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
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { FIREBASE_APP } from "../../FirebaseConfig";
    import { format } from "date-fns"; // Import date-fns untuk format tanggal
    import { useNavigation } from '@react-navigation/native';

    const CustomCalendar = () => {
        const [notes, setNotes] = useState<any[]>([]);
        const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
        const [selectedDate, setSelectedDate] = useState(new Date());
        const navigation = useNavigation();

        const formatTime = (time) => {
            if (time?.seconds) {
                const date = time.toDate(); // Konversi dari Timestamp ke Date
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return "Unknown Time"; // Default jika waktu tidak tersedia
        };
        const getFormattedDate = (time) => {
            if (time?.seconds) {
                const date = time.toDate(); // Konversi dari Timestamp ke Date
                return format(date, "EEEE, dd MMMM yyyy"); // Format: "Senin, 26 November 2024"
            }
            return "Unknown Date"; // Default jika waktu tidak tersedia
        };

        // Fungsi untuk mendapatkan nama hari
        const getDayName = (time) => {
            if (time?.seconds) {
                const date = time.toDate(); // Konversi dari Timestamp ke Date
                return format(date, "EEEE"); // Mengambil nama hari dari date-fns (e.g., "Monday")
            }
            return "Unknown Day"; // Default jika waktu tidak tersedia
        };
        // Ambil data dari Firestore
        useEffect(() => {
            const auth = getAuth();
            const db = getFirestore(FIREBASE_APP);
            let unsubscribeNotes: any = null;
        
            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    const userId = user.uid;
                    const userNotesCollection = collection(db, `users/${userId}/notes`);
                    const q = query(userNotesCollection, orderBy("createdAt", "desc"));
        
                     unsubscribeNotes = onSnapshot(q, (snapshot) => {
                    const newNotes = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        const time = data.time?.toDate(); // Konversi Timestamp ke Date
                        return {
                            id: doc.id,
                            ...data,
                            formattedDate: time ? format(time, "EEEE") : "Unknown Day", // Dapatkan nama hari
                            formattedTime: time ? format(time, "hh:mm a") : "Unknown Time", // Format waktu
                        };
                    });
                    setNotes(newNotes);
                    });
                } else {
                    setNotes([]);
                    if (unsubscribeNotes) {
                        unsubscribeNotes();
                        unsubscribeNotes = null;
                    }
                }
            });
        
            return () => {
                if (unsubscribeNotes) unsubscribeNotes();
                unsubscribeAuth();
            };
        }, []);
        

        // Atur tampilan DateTimePicker
        const showDatePicker = () => setDatePickerVisibility(true);
        const hideDatePicker = () => setDatePickerVisibility(false);
        const handleConfirm = (date: any) => {
            setSelectedDate(date);
            hideDatePicker();
        };
        const formatDateForCalendar = (time) => {
            if (time?.seconds) {
                const date = time.toDate();
                return format(date, "yyyy-MM-dd"); // Format tanggal menjadi '2024-11-29'
            }
            return null;
        };
           // Menandai tanggal yang memiliki catatan
    const markedDates = notes.reduce((acc, task) => {
        const formattedDate = formatDateForCalendar(task.time); // Format tanggal untuk kalender
        if (formattedDate) {
            acc[formattedDate] = {
                marked: true,
                dotColor: '#F4AB05', // Warna titik kuning
                activeOpacity: 0, // Tidak aktif, hanya menampilkan titik
            };
        }
        return acc;
    }, {});

        // Grupkan berdasarkan nama hari
        const taskGroup = notes.reduce((acc, task) => {
            const timeName = getFormattedDate(task.time); // Gunakan waktu untuk grupkan berdasarkan hari dan tanggal
            acc[timeName] = acc[timeName] ? [...acc[timeName], task] : [task];
            return acc;
        }, {});

        return (
            <ScrollView style={styles.container}>
                <View style={styles.containerCalendar}>
                    <Calendar
                        markedDates={markedDates} // Menandai tanggal dengan catatan
                        theme={{
                            backgroundColor: '#141d20',
                            calendarBackground: '#141d20',
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
                {Object.keys(taskGroup).length === 0 ? (
                    <Text style={styles.noNotesText}>You don't have any tasks yet.</Text>
                ) : (
                    Object.keys(taskGroup).map((time) => (
                        <View key={time}>
                            <Text style={styles.groupTitle}>{time}</Text>
                            {taskGroup[time].map((item: any) => (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}>
                                    <View style={styles.taskCard}>
                                        <View style={styles.indicator} />
                                        <View style={styles.taskContent}>
                                            <Text style={styles.taskTitle}>{item.title}</Text>
                                            <View style={styles.timeCategoryContainer}>
                                                <Text style={{ color: '#fff' }}>{item.formattedDate}</Text>
                                                <View style={styles.separatorLine} />
                                                <Text style={styles.taskTime}>{formatTime(item.time)}</Text>
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
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                )}
            </View>
            </ScrollView>
        );
    };



const styles = StyleSheet.create({
    container: {
        backgroundColor: '#141d20',
        flex: 1,
        paddingTop:50,
    },
    containerCalendar: {
        padding: 20,
        borderRadius: 30,
        margin: 20,
    },
    label: {
        color: '#fff',
        marginBottom: 10,
    },
    noNotesText: {
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
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
        marginBottom:100,
    },
    groupTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
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
