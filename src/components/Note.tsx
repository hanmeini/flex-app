import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"; // Import Timestamp
import { FIREBASE_APP } from "../../FirebaseConfig";
import { getAuth } from "firebase/auth";

const Note = ({ navigation }: any) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default date initialized to the current date
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState(["Personal", "Work", "Events"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [time, setTime] = useState<Timestamp | null>(null); // State to store the selected time as Timestamp

  // Show and hide date picker
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // Handle date picker confirmation
  const handleConfirm = (date: Date) => {
    setSelectedDate(date); // Update the selected date
    setTime(Timestamp.fromDate(date)); // Update the time state as a Firestore Timestamp
    hideDatePicker();
  };

  // Add note to Firestore
  const handleAddNote = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    if (!title.trim() || !description.trim() || !selectedCategory || !time) {
      console.error("Please fill all fields");
      return;
    }

    try {
      const db = getFirestore(FIREBASE_APP);
      const userNotesCollection = collection(db, `users/${userId}/notes`);

      // Save the time as a Firestore Timestamp directly
      await addDoc(userNotesCollection, {
        title,
        description,
        time, // Ensure time is a Timestamp object
        category: selectedCategory,
        createdAt: new Date(), // Firestore will automatically store this as a timestamp
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setTime(null); // Reset time state after submission

      // Navigate to Task screen with details
      navigation.navigate("All Task");
    } catch (error) {
      console.error("Error adding note to Firestore: ", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Input Title */}
      <View style={styles.judul}>
        <Text style={styles.textJudul}>Judul</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ketikan sesuatu disini"
          placeholderTextColor="#fff"
          style={{ color:'#fff' }}
        />
      </View>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Input Description */}
      <View style={styles.container2}>
        <ScrollView>
          <TextInput
            style={styles.formDeskripsi}
            value={description}
            onChangeText={setDescription}
            placeholder="Ketikan sesuatu disini"
            placeholderTextColor="#fff"
            multiline
          />
        </ScrollView>

        {/* Reminder and Categories */}
        <View style={styles.containerPengingat}>
          <View style={styles.containerbtn}>
            {/* Reminder Time Button */}
            <TouchableOpacity
              style={styles.buttonPengingat}
              onPress={showDatePicker}
            >
              <Ionicons name="alarm-outline" size={25} color="#fff" />
              <Text style={{ color: "#fff" }}>Pengingat</Text>
            </TouchableOpacity>
            {/* Add Note Button */}
            <TouchableOpacity
              style={styles.check}
              onPress={handleAddNote}
            >
              <Ionicons name="checkmark-outline" size={25} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Display Categories */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Pilih Kategori:</Text>
            <View style={styles.categoryRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[ 
                    styles.categoryButton, 
                    selectedCategory === category && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* DateTime Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default Note;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#141d20",
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  judul: {
    paddingTop: 30,
    borderRadius: 30,
    marginTop: 30,
  },
  textJudul: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#fff",
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 10,
  },
  container2: {
    height: 700,
    marginTop: 10,
    borderRadius: 30,
  },
  formDeskripsi: {
    color: "#fff",
    marginBottom: 20,
  },
  containerPengingat: {
    marginBottom: 20,
  },
  buttonPengingat: {
    backgroundColor: "#F4AB05",
    borderRadius: 30,
    paddingVertical: 7,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  check: {
    backgroundColor: "#F4AB05",
    borderRadius: 50,
    padding: 7,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  categorySection: {
    marginTop: 20,
    marginBottom:30,
  },
  sectionTitle: {
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#444",
    marginBottom: 5,
    minWidth: "30%",
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#F4AB05",
  },
  categoryText: {
    color: "#fff",
  },
  selectedCategoryText: {
    color: "#000",
  },
  containerbtn: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});