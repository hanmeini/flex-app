import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'; // Pastikan Ionicons diimpor
import { SearchBar } from '@rneui/themed'; 
import { Input } from '@rneui/base';

const Home = () => {
  return (
      <View style={styles.page}>
          <View style={styles.section}>
            <View style={{ display: "flex", flexDirection:"row", alignItems:"center" }}>
                <Image
                source={require('../../assets/images/WhatsApp Image 2024-09-02 at 11.13.35.jpeg')}
                style={styles.profileImage}
                />
                <View style={{ marginRight:100 }}>
                      <Text style={{ color:"#fff", fontWeight:"bold", fontSize:20, marginBottom:5, }}>Hello, Erland !</Text>
                      <Text style={{color:"#fff",}}>View Account</Text>
                </View>
                <TouchableOpacity 
                  style={{     backgroundColor: '#fff',
                      marginLeft : 20,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      borderRadius: 80,              }}>
                  <Ionicons name="notifications-outline" size={25}></Ionicons>
                </TouchableOpacity>
                
            </View>
              <View>
              <View style={styles.search}>
                <SearchBar
                placeholder='Type Here...'
                />
                </View>
              </View>
          </View>
        </View>
  )
}

export default Home

const styles = StyleSheet.create({
   page : {
        flex: 1,
        backgroundColor: "white",  
        overflow: 'hidden'
   },
   section : {
        flex: 1,
        backgroundColor: "#1A2529",
        maxHeight: "35%",
        borderBottomLeftRadius: 50,
        borderBottomEndRadius: 50,
        paddingTop : 50,
        paddingLeft :25,
   },
   profileImage : {
     width : 70,
     height :70,
     borderRadius :40,
     marginRight :15,
     
   },
   user: {
        flex: 1,
        textAlign: "center",
        paddingTop: 40,
        color: "#fff",
   },
   search: {
     paddingTop : 65,
     paddingRight :25,
     margin : 10,
   },

    
})