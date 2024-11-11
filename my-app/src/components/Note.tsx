import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FIREBASE_APP } from '../../FirebaseConfig';

const Note = ({navigation}:any) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState([]);
  const [reminderTime, setReminderTime] = useState('');

<<<<<<< HEAD
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date:any) => {
    setSelectedDate(date);
    setReminderTime(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    hideDatePicker();
  };

  // Menambahkan catatan ke Firestore
  const handleAddNote = async () => {
    const limitedDescription = description.split(' ').slice(0, 2).join(' ');
    const newNote = {
      title,
      description,
      time: reminderTime || 'No time set',
    };

    try {
      const db = getFirestore(FIREBASE_APP);
      const notesCollection = collection(db, 'notes');
      await addDoc(notesCollection, {
        title: newNote.title,
        description: newNote.description,
        time: newNote.time,
        createdAt: new Date(),
      });
      setTitle('');
      setDescription('');
      setReminderTime('');
    } catch (error) {
      console.error("Error adding note to Firestore: ", error);
    }
  };

  useEffect(() => {
    // Ambil Firestore instance
    const db = getFirestore(FIREBASE_APP);

    // Tentukan koleksi dan query
    const notesCollection = collection(db, 'notes');
    const q = query(notesCollection, orderBy('createdAt', 'desc'));

    // Menggunakan onSnapshot untuk mendengarkan perubahan
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes); // Set state notes dengan data baru
    });

    // Return unsubscribe untuk membersihkan listener saat komponen di-unmount
    return () => unsubscribe();
  }, []);

=======
const Note = () => {
>>>>>>> 97805167b32fe667c59d47e93e400605a44487c2
  return (
    <View style={styles.container}>
      <View style={styles.judul}>
        <Text style={styles.textJudul}>Judul</Text>
        <TextInput 
          value={title}
          onChangeText={setTitle}
          placeholder='Ketikan sesuatu disini'
        />
      </View>

      <View style={styles.container2}>
        <ScrollView>
          <TextInput 
            style={styles.formDeskripsi}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor='#fff' 
            placeholder='Ketikan sesuatu disini'
          />
        </ScrollView>

        <View style={styles.containerPengingat}>
          <View style={styles.containerbtn}>
            <TouchableOpacity style={styles.buttonPengingat} onPress={showDatePicker}>
              <Ionicons name="notifications-outline" size={25} color='#fff' />
              <Text style={{ color: '#fff' }}>Pengingat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.check}
              onPress={() => {
                handleAddNote(); // Add note to Firestore
                navigation.navigate('Task', { title, time: reminderTime, description }); // Navigate to Task screen
              }}
            >
              <Ionicons name="checkmark-outline" size={25} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.containerJam}>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={showDatePicker} style={styles.timeButton}>
                <Text style={styles.dateText}>
                  {reminderTime || 'Select time'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View>
          </View>
        </View>

        {/* Menampilkan catatan dari Firebase
        <View>
          {notes.map((note) => (
            <View key={note.id}>
              <Text>{note.title}</Text>
              <Text>{note.description}</Text>
              <Text>{note.time}</Text>
            </View>
          ))}
        </View> */}
      </View>
    </View>
  );
};

export default Note;

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#fff',
        flex:1,
        paddingHorizontal:30,
        paddingTop:10,
    },
    judul:{
        backgroundColor:'#F4AB05',
        maxWidth:'auto',
        height:120,
        paddingHorizontal:40,
        paddingTop:30,
        borderRadius:30,
        marginTop:30,
    },
    textJudul:{
        fontWeight:'bold',
        fontSize:20,
        letterSpacing:1,
        color: 'rgba(0, 0, 0, 0.5)',
        marginBottom:6,
    },
    container2:{
        backgroundColor:'#1A2529',
        height:580,
        marginTop:30,
        borderRadius:30,
        padding:40,
    },
    containerPengingat:{
        marginBottom:20,
    },
    buttonPengingat:{
        backgroundColor:'#F4AB05',
        borderRadius:30,
        paddingVertical:7,
        width:'40%',
        paddingHorizontal:3,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
    },
    formDeskripsi:{
        flexDirection:'column',
        color:'#fff',
        marginBottom:270,
    },
    containerbtn:{
        justifyContent:'space-between',
        display:'flex',
        flexDirection:'row',
    },
    check:{
        backgroundColor:'#F4AB05',
        borderRadius:50,
        padding:7,
        width:50,
        height:50,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
    },
    containerJam:{
        height:150,
        backgroundColor:'#dadada',
        marginTop:20,
        borderRadius:30,
        opacity:0.5,
        alignItems:'center',
        justifyContent:'center',
        gap:5,
    },
    dateText: {
        color: '#000',
        fontWeight: 'bold',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap:50,
        marginBottom: 20,
    },
    dateButton: {
        backgroundColor: '#F4AB05',
        padding: 10,
        borderRadius: 8,
    },
    timeButton: {
        backgroundColor: '#F4AB05',
        padding: 10,
        borderRadius: 8,
    },
});
