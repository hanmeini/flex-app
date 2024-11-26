// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBSnCHDADuATWPMMENdCS7EzLFYM45Ras",
  authDomain: "flexido-ac699.firebaseapp.com",
  projectId: "flexido-ac699",
  storageBucket: "flexido-ac699.firebasestorage.app",
  messagingSenderId: "974511282052",
  appId: "1:974511282052:web:11de92a2963bf4412eefd1"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)   
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

//943039554769-jbhku6bfhpp461l8vh6791ofc8ali02e.apps.googleusercontent.com