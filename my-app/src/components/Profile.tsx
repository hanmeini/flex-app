import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker'; // Mengimpor dari @react-native-picker/picker
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '@rneui/themed'; 

const Profile = () => {
  const [selectedDay, setSelectedDay] = useState("Hari Ini");
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Profil Section */}
      <View style={styles.profileContainer}>
          <Image 
            source={require('../../assets/images/WhatsApp Image 2024-09-02 at 11.13.35.jpeg')}
            style={styles.profileImage} />
          <Text style={styles.namaText}>Mikael Kelvian</Text>
      </View>
      <View>
        <TouchableOpacity style={styles.buttonText} onPress={() => navigation.navigate('Login')}>
          <Text>masuk</Text>
        </TouchableOpacity>
      </View>

      {/* Ringkasan Tugas */}
      <Text style={styles.summaryText}>Ringkasan Tugas</Text>

      {/* Kotak Tugas */}
      <View style={styles.taskSummaryContainer}>
        {/* Tugas Selesai */}
        <View style={styles.taskBox}>
          <Text style={styles.taskNumber}>0</Text>
          <Text style={styles.taskLabel}>Tugas Selesai</Text>
        </View>

        {/* Tugas Tertunda */}
        <View style={styles.taskBox}>
          <Text style={styles.taskNumber}>0</Text>
          <Text style={styles.taskLabel}>Tugas Tertunda</Text>
        </View>
      </View>

      {/* Kotak Chart Section */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Statistik Tugas</Text>
        <LineChart
          data={{
            labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
            datasets: [
              {
                data: [4, 0, 3, 2, 6, 2, 3], // Data yang ditampilkan di chart
              },
            ],
          }}
          width={Dimensions.get("window").width - 60} // Lebar chart menyesuaikan layar
          height={220}
          yAxisLabel=""
          yAxisSuffix=" Tugas"
          chartConfig={{
            backgroundColor: "#f9f9f9",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 10,
            borderRadius: 16,
          }}
        />
      </View>

      {/* Tugas dalam 7 hari kedepan */}
      <View style={styles.dayContainer}>
        <Text style={styles.dayText}>Tugas dalam 7 hari kedepan</Text>
      </View>

      {/* Tugas yang belum selesai */}
      <View style={styles.yetTaskContainer}>
        <View style={styles.yetTaskHeader}>
          <Text style={styles.yetTaskTitle}>Tugas yang belum selesai</Text>
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
        {/* Placeholder untuk menambahkan data */}
        <View style={styles.yetTaskContent}>
          <Text>Data tugas yang belum selesai akan ditampilkan di sini.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 40, // Membuat gambar profil menjadi bulat
    marginRight: 15,
  },
  namaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
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
    textAlign: 'left',
  },
  taskSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskBox: {
    width: '49%', // Mengambil 49% dari lebar layar untuk dua kotak
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  taskLabel: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  chartContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
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
  },
  yetTaskContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
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
