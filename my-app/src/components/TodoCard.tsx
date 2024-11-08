import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const ToDoCard = ({ title, time, description, onSettingsPress }) => {
    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={30} color="#fff" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.time}>{time}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
            <TouchableOpacity onPress={onSettingsPress} style={styles.settingsIcon}>
                <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#1A2529',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        backgroundColor: '#F4AB05',
        borderRadius: 10,
        padding: 10,
    },
    contentContainer: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        color: '#bbb',
        fontSize: 14,
    },
    description: {
        color: '#bbb',
        fontSize: 12,
    },
    settingsIcon: {
        backgroundColor: '#333',
        padding: 8,
        borderRadius: 15,
    },
});

export default ToDoCard;
