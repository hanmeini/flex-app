import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import React from 'react'


const Note = () => {
  return (
    <View style={styles.container}>
      <View style={styles.judul}>
        <Text style={styles.textJudul}>Judul</Text>
        <TextInput placeholder='Ketikan sesuatu disini'/>
      </View>
      <View style={styles.container2}>
        <ScrollView>
            <TextInput style={styles.formDeskripsi} placeholderTextColor='#fff' placeholder='Ketikan sesuatu disini'/>
        </ScrollView>
        <View style={styles.containerPengingat}>
            <View style={styles.containerbtn}>
                <TouchableOpacity style={styles.buttonPengingat}>
                    <Ionicons name="notifications-outline" size={25} color='#fff' />
                    <Text style={{ color:'#fff' }}>Pengingat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.check}>
                    <Ionicons name="checkmark-outline" size={25} color='#fff'/>
                </TouchableOpacity>
            </View>
            <View style={styles.containerJam}>

            </View>
        </View>
      </View>
    </View>
  )
}

export default Note

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
    }

})