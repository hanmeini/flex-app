import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const TaskDetailScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [categories, setCategories] = useState(["Personal", "Work", "Events"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Show and hide date picker
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // Handle date picker confirmation
  const handleConfirm = (date: Date) => {
    setReminderTime(
      `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
    hideDatePicker();
  };

  useEffect(() => {
    const fetchTaskDetail = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not logged in");
        return;
      }

      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes`, taskId);
      const taskSnap = await getDoc(taskRef);

      if (taskSnap.exists()) {
        const data = taskSnap.data();
        setTask(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setReminderTime(data.time || "No time set");
        setSelectedCategory(data.category || "Personal"); // Set default selected category
      } else {
        console.error("No such task!");
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  const handleUpdateTask = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    try {
      const db = getFirestore(FIREBASE_APP);
      const taskRef = doc(db, `users/${userId}/notes`, taskId);

      await updateDoc(taskRef, {
        title,
        description,
        time: reminderTime || "No time set",
        category: selectedCategory,
      });

      Alert.alert("Success", "Task updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
          style={{ color: "#fff" }}
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
            {/* Update Task Button */}
            <TouchableOpacity style={styles.check} onPress={handleUpdateTask}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  label: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timePickerButton: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  timePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    color: '#fff',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  goBackText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
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
  containerbtn: {
    flexDirection: "row",
    justifyContent: "space-between",
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
});

export default TaskDetailScreen;
