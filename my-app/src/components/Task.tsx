import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Pastikan Ionicons diimpor

const Task = ({navigation}) => {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [showInput, setShowInput] = useState(false); // Mengatur apakah input ditampilkan atau tidak
  const inputRef = useRef(null); // Menggunakan ref untuk memfokuskan input

  // Fungsi untuk menambahkan task ke list
  const addTask = () => {
    if (task) {
      setTaskList([...taskList, { id: Math.random().toString(), value: task }]);
      setTask(''); // Mengosongkan input setelah menambahkan task
      setShowInput(false); // Sembunyikan input setelah task ditambahkan
      Keyboard.dismiss(); // Menyembunyikan keyboard setelah task ditambahkan
    }
  };

  // Fungsi untuk memfokuskan input dan menampilkan keyboard saat tombol + ditekan
  const focusInput = () => {
    navigation.navigate('Note');
  };

  // Fungsi untuk menghapus task dari list
  const removeTask = (taskId) => {
    setTaskList(taskList.filter((task) => task.id !== taskId));
  };

  return (
    <View style={styles.container}>
      {/* Daftar task */}
      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>{item.value}</Text>
            <TouchableOpacity onPress={() => removeTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noTaskText}>No tasks available</Text>}
      />

      {/* Input task di bagian bawah, hanya muncul setelah to mbol tambah ditekan */}
      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef} // Menyambungkan ref ke TextInput
            style={styles.input}
            placeholder="Add a new task"
            value={task}
            onChangeText={setTask}
            onSubmitEditing={addTask} // Menambah task ketika tombol "Enter" ditekan
          />
        </View>
      )}

      {/* Tombol tambah task di kanan bawah */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => 
        navigation.navigate('Note')
      }>
        <Ionicons name="add-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  taskText: {
    fontSize: 18,
  },
  deleteButton: {
    color: '#dc3545',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noTaskText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontSize: 18,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#F4AB05', // Warna tombol sesuai tema Flexido
    borderRadius: 15,
    padding: 17,
    elevation: 5, // Menambah bayangan pada tombol
  },
});
