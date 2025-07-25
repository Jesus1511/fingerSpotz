import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCm58AXJ1YNn5lALh3h07A8L9NDhyRKsWs",
  authDomain: "fingerspotz-c5a18.firebaseapp.com",
  projectId: "fingerspotz-c5a18",
  storageBucket: "fingerspotz-c5a18.appspot.com",
  messagingSenderId: "977479978130",
  appId: "1:977479978130:android:371820062ab8f8ddec2a4b",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth con AsyncStorage como persistencia
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa Firestore
const db = getFirestore(app);

export { auth, db };
