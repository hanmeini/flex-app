import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'react-native-calendars';
import { ScrollView } from 'react-native';
import ToDoCard from './TodoCard';

const CustomCalendar = () => {
    // kalender
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date:any) => {
        setSelectedDate(date);
        hideDatePicker();
    };
    // data dummy card
    const dataDummy = [
      {id: 1, title:'Tugas bahasa Indonesia', time:'08.00 - 24.00', description:'segera kerjakan', date:'2024-08-02',},
      {id: 2, title:'Tugas bahasa Indonesia', time:'08.00 - 24.00', description:'segera kerjakan', date:'2024-08-02',},
      {id: 3, title:'Tugas bahasa Indonesia', time:'08.00 - 24.00', description:'segera kerjakan', date:'2024-08-03',},
      {id: 4, title:'Tugas bahasa Indonesia', time:'08.00 - 24.00', description:'segera kerjakan', date:'2024-08-03',},
      {id: 5, title:'Tugas bahasa Indonesia', time:'08.00 - 24.00', description:'segera kerjakan', date:'2024-08-03',},
      {id: 6, title:'Tugas bahasa Indonesia', time:'08.00 - 24.00', description:'segera kerjakan', date:'2024-08-04',},
    ];
    // untuk mengatur menyortir card berdasarkan hari
    const taskGroup = dataDummy.reduce((acc, task) => {
      acc[task.date] = acc[task.date] ? [...acc[task.date], task] : [task];
      return acc;
    }, {});

    const handleSettingsPress = () => {
      alert('Settings clicked');
    };


    return (
      <ScrollView>
        <View style={styles.container}>
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

        {/* // Divider */}
        <View style={styles.divider}></View>
        <View style={styles.containerReminder}>
        
        {/* CardTodo */}
        {Object.keys(taskGroup).map((date) => (
        <View key={date}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{date}</Text>
          {taskGroup[date].map((task, index) => (
            <ToDoCard
              key={index}
              title={task.title}
              time={task.time}
              description={task.description}
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
    container: {
        padding: 20,
        backgroundColor: '#1A2529',
        borderRadius: 30,
        margin:20,
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
    divider:{
      height: 2,
      backgroundColor: '#DADADA', // Warna divider
      marginVertical: 10, // Jarak vertikal di sekitar divider
    },
    containerReminder:{
      margin:20,

    },
    date: {
      color: '#000',
      fontSize: 18,
      marginBottom: 10,
  },
});

export default CustomCalendar;
