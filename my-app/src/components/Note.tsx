import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { FIREBASE_APP } from "../../FirebaseConfig";
import { getAuth } from "firebase/auth";

const Note = ({ navigation }: any) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [categories, setCategories] = useState(["Personal", "Work", "Events"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Show and hide date picker
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // Handle date picker confirmation
  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    setReminderTime(
      date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
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

    if (!title.trim() || !description.trim() || !selectedCategory) {
      console.error("Please fill all fields");
      return;
    }

    try {
      const db = getFirestore(FIREBASE_APP);
      const userNotesCollection = collection(db, `users/${userId}/notes`);
      await addDoc(userNotesCollection, {
        title,
        description,
        time: reminderTime || "No time set",
        category: selectedCategory,
        createdAt: new Date(),
      });

      // Reset form
      setTitle("");
      setDescription("");
      setReminderTime("");
      setSelectedCategory("");

      // Navigate to Task screen with details
      navigation.navigate("Task", { title, time: reminderTime, description });
    } catch (error) {
      console.error("Error adding note to Firestore: ", error);
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setNewCategory("");
    } else {
      console.error("Category is empty or already exists.");
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
        />
      </View>

      <View style={styles.container2}>
        {/* Input Description */}
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

        <View style={styles.containerPengingat}>
          {/* Reminder Time Button */}
          <View style={styles.containerbtn}>
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
            {categories.map((category) => (
              <View style={{ maxWidth:'auto',flexDirection:'row', justifyContent:'space-between' }}>
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
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* DateTime Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
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
    height: 120,
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
  container2: {
    height: 700,
    marginTop: 30,
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
    marginBottom:40,
    maxWidth:'auto',
    flexDirection:'column'
  },
  sectionTitle: {
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
  categoryButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#444",
    marginBottom: 5,
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
  newCategorySection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  newCategoryInput: {
    flex: 1,
    color: "#fff",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  addCategoryButton: {
    backgroundColor: "#F4AB05",
    padding: 10,
    borderRadius: 8,
  },
  containerbtn:{
    flexDirection:'row',
    justifyContent:'space-between'
  }
});
