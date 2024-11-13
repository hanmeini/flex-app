import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../../FirebaseConfig";

const Task = ({ navigation }: any) => {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    const db = getFirestore(FIREBASE_APP);
    const userNotesCollection = collection(db,`users/${userId}/notes`);
    const q = query(userNotesCollection, orderBy("createdAt", "desc")); // Urutkan berdasarkan tanggal pembuatan

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={30} color="#fff" />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
              {item.description && (
                <Text style={styles.description}>
                  {item.description.split(" ").slice(0, 5).join(" ") + "..."}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => console.log("Settings pressed")}
              style={styles.settingsIcon}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Note")}
      >
        <Ionicons name="add-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1A2529",
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    backgroundColor: "#F4AB05",
    borderRadius: 10,
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  time: {
    color: "#bbb",
    fontSize: 14,
  },
  description: {
    color: "#bbb",
    fontSize: 12,
  },
  settingsIcon: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 15,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#F4AB05",
    borderRadius: 15,
    padding: 17,
    elevation: 5,
  },
});

export default Task;