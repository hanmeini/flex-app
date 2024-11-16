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
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    const db = getFirestore(FIREBASE_APP);
    const userNotesCollection = collection(db, `users/${userId}/notes`);
    const q = query(userNotesCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes);
    });

    return () => unsubscribe();
  }, []);

  const filteredNotes =
    selectedFilter === "All"
      ? notes
      : notes.filter((note) => note.category === selectedFilter);

      return (
        <View style={styles.container}>
          <View>
            <Text style={styles.judul}>Categories</Text>
          <View style={styles.filterContainer}>
            {["All", "Personal", "Work", "Events"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  selectedFilter === filter && styles.activeFilterTab,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          </View>
          <Text style={styles.judul}>My Task</Text>
          <FlatList
          style={styles.flatlist}
            data={filteredNotes}
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
        </View>
      );      
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A2529",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom:-120,
  },
  filterTab: {
    width: "48%", // Two boxes per row
    aspectRatio: 1, // Make the box square
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 8,
  },
  activeFilterTab: {
    backgroundColor: "#F4AB05",
  },
  filterText: {
    color: "#a0a0a0",
    fontFamily: "figtree",
    fontSize: 16,
  },
  activeFilterText: {
    color: "#1A2529",
    fontFamily: "figtree-semibold",
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
  flatlist: {
    flexGrow:1,
  },
  judul:{
    fontSize:20,
    fontWeight:'500',
    marginBottom:15,
    color:'#fff'
  }

});

export default Task;
