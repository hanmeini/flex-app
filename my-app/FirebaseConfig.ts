// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
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
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);