import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

const Profile = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Tugas 1', status: 'selesai' },
    { id: 2, title: 'Tugas 2', status: 'tertunda' },
    { id: 3, title: 'Tugas 3', status: 'belum selesai' },
    { id: 4, title: 'Tugas 4', status: 'selesai' },
  ]);
  const [selectedDay, setSelectedDay] = useState("Hari Ini");

  const completedTasks = tasks.filter(task => task.status === 'selesai').length;
  const pendingTasks = tasks.filter(task => task.status === 'tertunda').length;
  const incompleteTasks = tasks.filter(task => task.status === 'belum selesai').length;

  return (
    <ScrollView style={styles.container}>

      <View style={styles.profileContainer}>
    
        <Text style={styles.namaText}>Mikhael Kelvian</Text>
      </View>

      {/* Ringkasan Tugas */}
      <Text style={styles.summaryText}>Ringkasan Tugas</Text>
      <View style={styles.taskSummaryContainer}>
        <View style={styles.taskBox}>
          <Text style={styles.taskNumber}>{completedTasks}</Text>
          <Text style={styles.taskLabel}>Tugas Selesai</Text>
        </View>
        <View style={styles.taskBox}>
          <Text style={styles.taskNumber}>{pendingTasks}</Text>
          <Text style={styles.taskLabel}>Tugas Tertunda</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Penyelesaian Tugas Harian</Text>
        <Text style={styles.textstatus}>Belum selesai</Text>
        <ProgressBar progress={incompleteTasks / tasks.length} color="#D27D3D" style={styles.full} />
        <Text style={styles.textstatus}>Tugas Tertunda</Text>
        <ProgressBar progress={pendingTasks / tasks.length} color="#1F5EAD" style={styles.full} />
        <Text style={styles.textstatus}>Selesai</Text>
        <ProgressBar progress={completedTasks / tasks.length} color="#63A133" style={styles.full} />
      </View>

      {/* Tugas yang belum selesai */}
      <View style={styles.yetTaskContainer}>
        <View style={styles.yetTaskHeader}>
          <Text style={styles.yetTaskTitle}>Klasifikasi Tugas yang belum selesai</Text>
          <Picker
            selectedValue={selectedDay}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
          >
            <Picker.Item label="Dalam 7 hari" value="Dalam 7 hari" />
            <Picker.Item label="Dalam 30 hari" value="Dalam 30 hari" />
            <Picker.Item label="Semua" value="Semua" />
          </Picker>
        </View>
        <View style={styles.yetTaskContent}>
          {tasks.filter(task => task.status === 'belum selesai').map(task => (
            <Text key={task.id}>{task.title}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:20,
    paddingTop:50,
    backgroundColor: '#1A2529',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
    marginLeft: 2,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 40, // Membuat gambar profil menjadi bulat
    marginRight: 20,
    marginLeft: 13,
  },
  namaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  loginContainer: {
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 18,
    color: '#007bff', // Warna teks untuk tombol login
  },
  summaryText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 25,
    textAlign: 'left',
    color: '#fff'
  },
  taskSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskBox: {
    width: '49%', // Mengambil 49% dari lebar layar untuk dua kotak
    padding: 20,
    backgroundColor: '#F4AB05',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  taskLabel: {
    fontSize: 16,
    color: '#000000',
    marginTop: 5,
  },
  full: {   //progress
    height: 9,
    marginRight: 8,
    borderRadius: 5,
    marginVertical: 20,
  },
  textstatus:{
    marginBottom: -19,
  },
  chartContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  dayContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 17,
  },
  yetTaskContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 17,
    flex: 1, // Memastikan container memanjang ke bawah
  },
  yetTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  yetTaskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 1,
    paddingBottom: 30,
  },
  picker: {
    height: 50,
    width: 150,
  },
  yetTaskContent: {
    flex: 1, // Memastikan konten dapat mengisi ruang yang tersedia
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});